// db.js - Gestor de Base de Dados Local (IndexedDB)
const DB_NAME = "GreenHerbLocal";
const DB_VERSION = 1;
const STORE_NAME = "planos_offline";

// Função para abrir/inicializar a base de dados
function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // Criamos a store com um ID autoincrementado
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao abrir IndexedDB");
    });
}

// Função para guardar um plano quando o servidor falha
async function guardarPlanoOffline(plano) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        // Adicionamos um marcador para saber que este dado é local
        const planoComStatus = { ...plano, status: 'offline', dataLocal: new Date().toISOString() };
        
        const request = store.add(planoComStatus);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Erro ao guardar no IndexedDB");
    });
}

// Função para listar todos os planos guardados offline
async function listarPlanosOffline() {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao ler do IndexedDB");
    });
}

// Função para limpar um plano após sincronização
async function removerPlanoOffline(id) {
    const db = await abrirDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
}

// db.js - Adicionar ao final
async function sincronizarPlanos() {
    const planosOffline = await listarPlanosOffline();
    
    if (planosOffline.length === 0) return;

    console.log(`A sincronizar ${planosOffline.length} planos...`);

    for (const plano of planosOffline) {
        try {
            // Criamos uma cópia do objeto sem os campos temporários do IndexedDB
            const { id, status, dataLocal, ...dadosParaEnviar } = plano;

            const response = await fetch('http://localhost:5000/api/planos/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (response.ok) {
                // Se o MongoDB aceitou, apagamos do IndexedDB
                await removerPlanoOffline(plano.id);
                console.log(`Plano "${plano.nome}" sincronizado com sucesso!`);
            }
        } catch (err) {
            console.error("Falha na sincronização. O servidor ainda está offline.");
            break; // Para a execução se o servidor cair a meio
        }
    }
    
    // Se estivermos no index.html, recarregamos a lista
    if (typeof renderizarPlanos === 'function') {
        renderizarPlanos();
    }
}
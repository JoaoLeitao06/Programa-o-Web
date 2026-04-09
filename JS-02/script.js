// --- LocalStorage e SessionStorage ---
function guardarLocal() {
    let nome = document.getElementById("nome").value;
    localStorage.setItem("nomeLocal", nome);
    console.log("Guardado no localStorage: " + nome); 
}

function guardarSession() {
    let nome = document.getElementById("nome").value;
    sessionStorage.setItem("nomeSession", nome);
    console.log("Guardado no sessionStorage: " + nome); 
}

function lerDados() {
    let local = localStorage.getItem("nomeLocal");
    let session = sessionStorage.getItem("nomeSession");
    console.log("LocalStorage:", local); 
    console.log("SessionStorage:", session); 
    alert("Local: " + local + "\nSession: " + session);
}

// --- IndexedDB ---
let db;
const request = indexedDB.open("EscolaDB", 1); 

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("alunos")) {
        db.createObjectStore("alunos", { keyPath: "id" }); 
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Base de dados IndexedDB pronta"); 
};

function guardarAluno() {
    let id = parseInt(document.getElementById("alunoId").value);
    let nome = document.getElementById("alunoNome").value;
    let curso = document.getElementById("alunoCurso").value;

    let transaction = db.transaction(["alunos"], "readwrite"); 
    let store = transaction.objectStore("alunos"); 
    
    let aluno = { id: id, nome: nome, curso: curso }; 
    store.add(aluno); 
    
    transaction.oncomplete = function() {
        console.log("Aluno guardado com sucesso!"); 
        listarAlunos();
    };
}

function listarAlunos() {
    let store = db.transaction("alunos").objectStore("alunos");
    let request = store.getAll();

    request.onsuccess = function() {
        let alunos = request.result;
        let tabela = document.getElementById("corpoTabela");
        tabela.innerHTML = ""; // Limpar tabela

        alunos.forEach(aluno => {
            let linha = `<tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.curso}</td>
            </tr>`;
            tabela.innerHTML += linha; 
        });
    };
}
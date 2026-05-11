document.addEventListener('DOMContentLoaded', () => {
    // Inicializar "Base de Dados" de utilizadores no LocalStorage se não existir
    if (!localStorage.getItem('greenherb_users')) {
        const initialUsers = {
            'admin': { nome: 'Administrador Global', role: 'Administrador', password: '1234' },
            'tecnico': { nome: 'João Técnico', role: 'Tecnico', password: '1234' },
            'responsavel': { nome: 'Maria Responsável', role: 'Responsavel', password: '1234' }
        };
        localStorage.setItem('greenherb_users', JSON.stringify(initialUsers));
    }

    // Elementos da UI
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    // --- LÓGICA DE ALTERNAR ABAS ---
    tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        esconderMensagens();
    });

    tabRegisterBtn.addEventListener('click', () => {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        esconderMensagens();
    });

    function esconderMensagens() {
        loginMessage.className = 'msg-box hidden';
        registerMessage.className = 'msg-box hidden';
    }

    function mostrarMensagem(elemento, mensagem, tipo) {
        elemento.textContent = mensagem;
        elemento.className = `msg-box msg-${tipo}`;
    }

    // --- LÓGICA DE REGISTO (SIGN UP) ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('regUsername').value.trim().toLowerCase();
        const nome = document.getElementById('regNome').value;
        const role = document.getElementById('regRole').value;
        const password = document.getElementById('regPassword').value;

        // Obter utilizadores atuais do LocalStorage
        const usersDB = JSON.parse(localStorage.getItem('greenherb_users'));

        if (usersDB[username]) {
            mostrarMensagem(registerMessage, 'Este nome de utilizador já existe!', 'error');
        } else {
            // Adicionar novo utilizador à "Base de Dados"
            usersDB[username] = { nome, role, password };
            localStorage.setItem('greenherb_users', JSON.stringify(usersDB));

            mostrarMensagem(registerMessage, 'Conta criada com sucesso! Podes fazer login.', 'success');
            registerForm.reset();

            // Opcional: Mudar para a aba de login passado 2 segundos
            setTimeout(() => {
                tabLoginBtn.click();
            }, 2000);
        }
    });

    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        // Obter utilizadores atualizados
        const usersDB = JSON.parse(localStorage.getItem('greenherb_users'));

        if (usersDB[username] && usersDB[username].password === password) {
            // Guarda a sessão e avança
            sessionStorage.setItem('greenherb_user', JSON.stringify({
                username: username,
                nome: usersDB[username].nome,
                role: usersDB[username].role
            }));
            window.location.href = 'index.html';
        } else {
            mostrarMensagem(loginMessage, 'Utilizador ou palavra-passe incorretos!', 'error');
        }
    });
});
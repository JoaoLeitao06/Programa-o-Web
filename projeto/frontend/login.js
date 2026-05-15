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

    // --- LÓGICA DE REGISTO (SIGN UP) LIGADA À API ---
    registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        nome: document.getElementById('regNome').value,
        username: document.getElementById('regUsername').value.trim().toLowerCase(),
        password: document.getElementById('regPassword').value
    };

    try {
        // Envia os dados para o teu backend Node.js
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensagem(registerMessage, 'Conta criada! Aguarda aprovação do administrador.', 'success');
            registerForm.reset();
            
            setTimeout(() => tabLoginBtn.click(), 3000);
        } else {
            mostrarMensagem(registerMessage, data.msg || 'Erro ao registar', 'error');
        }
    } catch (err) {
        mostrarMensagem(registerMessage, 'Erro: O servidor backend está ligado?', 'error');
    }
});

    // --- LÓGICA DE LOGIN (ENTRAR) LIGADA À API ---
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 1. Guardar o Token e os dados do utilizador
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            mostrarMensagem(loginMessage, 'Login efetuado! A redirecionar...', 'success');

            // 2. Redirecionar para o dashboard após 1 segundo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            mostrarMensagem(loginMessage, data.msg || 'Credenciais inválidas', 'error');
        }
    } catch (err) {
        mostrarMensagem(loginMessage, 'Erro: O servidor backend está ligado?', 'error');
    }
    });
});
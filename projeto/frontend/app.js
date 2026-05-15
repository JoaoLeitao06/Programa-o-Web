// 1. VERIFICAÇÃO DE LOGIN
const token = localStorage.getItem('token');
const currentUserData = localStorage.getItem('user');

if (!token && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}

if (window.location.pathname.includes('novo-plano.html')) {
    if (currentUser && currentUser.role === 'Pendente') {
        alert("Acesso Negado: Não tens permissões para criar planos.");
        window.location.href = 'index.html';
    }
}

const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser && !window.location.pathname.includes('login.html')) return;

    if (currentUser && currentUser.role === 'Pendente') {
        const aviso = document.getElementById('avisoPendente');
        if (aviso) {
            aviso.classList.remove('hidden');
        }

        // Aproveita e esconde também o botão de criar planos
        const btnNovoPlano = document.querySelector('.btn-primary');
        if (btnNovoPlano) {
            btnNovoPlano.classList.add('hidden');
        }
    }

    // --- 1. CABEÇALHO GLOBAL ---
    const nameDisplay = document.getElementById('userNameDisplay');
    const roleBadge = document.getElementById('userRoleBadge');

    if (nameDisplay) nameDisplay.textContent = `Olá, ${currentUser.nome}`;
    if (roleBadge) {
        roleBadge.textContent = currentUser.role;
        if (currentUser.role === 'Administrador') roleBadge.style.background = '#212121';
        else if (currentUser.role === 'Responsavel') roleBadge.style.background = '#f57c00';
        else roleBadge.style.background = '#1976d2'; 
    }

    // --- 2. LÓGICA DE NAVEGAÇÃO / VISTAS ---
    const btnGestao = document.getElementById('btnGestaoUtilizadores');
    const adminSection = document.getElementById('adminSection');
    const listaPlanosSection = document.querySelector('.list-section:not(#adminSection)');
    const statsGrid = document.querySelector('.stats-grid');
    const actionBar = document.querySelector('.action-bar');

    // Se estivermos no index.html, garantimos que tudo aparece
    if (btnGestao && currentUser.role === 'Administrador') {
        btnGestao.classList.remove('hidden');
        
        btnGestao.addEventListener('click', () => {
            // Esconder Dashboard
            if (statsGrid) statsGrid.classList.add('hidden');
            if (listaPlanosSection) listaPlanosSection.classList.add('hidden');
            // Mostrar Gestão
            if (adminSection) {
                adminSection.classList.remove('hidden');
                carregarUtilizadores();
            }
        });
    }

    const btnNovoPlano = document.querySelector('.btn-primary'); // O botão de "+ Implementar Novo Plano"

    if (currentUser && currentUser.role === 'Pendente') {
        if (btnNovoPlano) {
            // Opção A: Esconder o botão totalmente
            btnNovoPlano.classList.add('hidden'); 
        
            // Opção B: Mostrar mas avisar (Mais amigável para o utilizador)
            /*
            btnNovoPlano.style.opacity = "0.5";
            btnNovoPlano.style.cursor = "not-allowed";
            btnNovoPlano.onclick = (e) => {
                e.preventDefault();
                alert("A tua conta ainda está Pendente. Aguarda aprovação do administrador para criar planos.");
            };
            */
        }
    }

    // --- 3. CARREGAR DADOS (Planos) ---
    // Chamamos a função de renderizar planos sempre que a página carrega
    if (document.getElementById('listaPlanos')) {
        renderizarPlanos();
    }

    // Sincronização Offline/Online
    if (typeof sincronizarPlanos === 'function') { sincronizarPlanos(); }
    window.addEventListener('online', () => {
        if (typeof sincronizarPlanos === 'function') { sincronizarPlanos(); }
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    async function renderizarPlanos() {
        try {
            const response = await fetch('http://localhost:5000/api/planos/all');
            let planosOnline = [];
            if (response.ok) { planosOnline = await response.json(); }

            const planosOffline = typeof listarPlanosOffline === 'function' ? await listarPlanosOffline() : [];
            const todosOsPlanos = [...planosOffline, ...planosOnline];

            const listaElement = document.getElementById('listaPlanos');
            listaElement.innerHTML = '';

            document.getElementById('totalPlanos').textContent = todosOsPlanos.length;
            const emergencias = todosOsPlanos.filter(p => p.tipo === 'Emergencia').length;
            document.getElementById('totalEmergencias').textContent = emergencias;

            todosOsPlanos.forEach(plano => {
                const card = document.createElement('div');
                card.className = 'plan-card';
                if (plano.status === 'offline') {
                    card.style.borderLeft = "5px solid #ff9800";
                    card.style.background = "#fff3e0";
                }

                const badgeClass = plano.tipo.toLowerCase();
                let detalhes = '';
                if (plano.tipo === 'Regular') detalhes = `Rega: ${plano.detalhes.rega}`;
                else if (plano.tipo === 'Emergencia') detalhes = `Ação: ${plano.detalhes.intervencao}`;
                else detalhes = `Motivo: ${plano.detalhes.motivo}`;

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4>${plano.nome} ${plano.status === 'offline' ? '⚠️' : ''}</h4>
                        ${plano.status !== 'offline' ? `
                            <button class="btn-delete" onclick="eliminarPlano('${plano._id}')" 
                                    style="background:none; border:none; color:#e53935; cursor:pointer;">&times;</button>
                        ` : ''}
                    </div>
                    <p><strong>Erva:</strong> ${plano.erva}</p>
                    <p><span class="badge ${badgeClass}">${plano.tipo}</span></p>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid #c8e6c9;">
                    <p style="font-size: 0.9rem;">${detalhes}</p>
                    <p style="font-size: 0.75rem; color: #888; margin-top: 10px;">
                        👤 ${plano.criadoPor} | ${plano.status === 'offline' ? '📍 Local' : '📅 ' + plano.dataRegisto}
                    </p>
                `;
                listaElement.appendChild(card);
            });
        } catch (err) { console.error("Erro ao renderizar:", err); }
    }

    // --- FORMULÁRIO NOVO PLANO ---
    const planoForm = document.getElementById('planoForm');
    if (planoForm) {
        const tipoPlanoSelect = document.getElementById('tipoPlano');
        const checkboxAutorizacao = document.getElementById('autorizacaoResp');
        const avisoAutorizacao = document.getElementById('avisoAutorizacao');

        const seccoes = {
            'Regular': document.getElementById('camposRegular'),
            'Emergencia': document.getElementById('camposEmergencia'),
            'Pontual': document.getElementById('camposPontual')
        };

        tipoPlanoSelect.addEventListener('change', (e) => {
            Object.values(seccoes).forEach(sec => sec && sec.classList.add('hidden'));
            const selecionado = e.target.value;
            if (selecionado && seccoes[selecionado]) seccoes[selecionado].classList.remove('hidden');

            if (selecionado === 'Pontual') {
                if (currentUser.role === 'Tecnico') {
                    checkboxAutorizacao.disabled = true;
                    checkboxAutorizacao.checked = false;
                    avisoAutorizacao.classList.remove('hidden');
                } else {
                    checkboxAutorizacao.disabled = false;
                    avisoAutorizacao.classList.add('hidden');
                }
            }
        });

        planoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tipo = tipoPlanoSelect.value;

            if (tipo === 'Pontual' && !checkboxAutorizacao.checked) {
                alert('Impossível guardar: Falta autorização!');
                return;
            }

            const novoPlano = {
                nome: document.getElementById('nomePlano').value,
                erva: document.getElementById('ervaAromatica').value,
                tipo: tipo,
                criadoPor: currentUser.nome,
                dataRegisto: new Date().toLocaleString('pt-PT')
            };

            if (tipo === 'Regular') {
                novoPlano.detalhes = {
                    tempMin: document.getElementById('tempMin').value,
                    tempMax: document.getElementById('tempMax').value,
                    rega: document.getElementById('planoRega').value
                };
            } else if (tipo === 'Emergencia') {
                novoPlano.detalhes = {
                    intervencao: document.getElementById('tipoIntervencao').value,
                    dosagem: document.getElementById('dosagem').value
                };
            } else if (tipo === 'Pontual') {
                novoPlano.detalhes = { motivo: document.getElementById('motivoPontual').value };
            }

            try {
                const response = await fetch('http://localhost:5000/api/planos/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoPlano)
                });
                if (response.ok) { window.location.href = 'index.html'; }
                else { throw new Error(); }
            } catch (err) {
                if (typeof guardarPlanoOffline === 'function') {
                    await guardarPlanoOffline(novoPlano);
                    alert('Guardado localmente (Offline).');
                    window.location.href = 'index.html';
                }
            }
        });
    }
});

// --- FUNÇÕES GLOBAIS ---

async function eliminarPlano(id) {
    if (confirm('Eliminar este plano?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/planos/${id}`, { method: 'DELETE' });
            if (response.ok) location.reload();
        } catch (err) { alert('Erro ao eliminar.'); }
    }
}

async function carregarUtilizadores() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/users');
        const users = await response.json();
        const tabela = document.getElementById('tabelaUtilizadores');
        if (!tabela) return;
        tabela.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.username}</td>
                <td><span class="badge" style="background:${getRoleColor(user.role)}">${user.role}</span></td>
                <td>
                    <select class="select-admin" onchange="alterarPerfil('${user._id}', this.value)">
                        <option value="">Alterar...</option>
                        <option value="Tecnico">Técnico</option>
                        <option value="Responsavel">Responsável</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

window.alterarPerfil = async function(id, novoRole) {
    if (!novoRole || !confirm(`Alterar para ${novoRole}?`)) return;
    try {
        const response = await fetch(`http://localhost:5000/api/auth/update-role/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: novoRole })
        });
        if (response.ok) location.reload();
    } catch (err) { alert("Erro de ligação."); }
};

function getRoleColor(role) {
    if (role === 'Administrador') return '#212121';
    if (role === 'Responsavel') return '#f57c00';
    if (role === 'Tecnico') return '#1976d2';
    return '#757575';
}

// --- FUNÇÃO DE LOGOUT GLOBAL ---
// Coloca isto no fim de tudo para ser independente do resto do código
function fazerLogout() {
    if (confirm('Desejas terminar a sessão e sair do sistema?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Tornar a função visível para o clique no HTML
window.fazerLogout = fazerLogout;
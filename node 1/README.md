# Lab Node-01

Aplicação ExpressJS para o Laboratório Node 01.

## Endpoints

- `GET /` - retorna todas as notas
- `GET /:pos` - retorna a nota na posição indicada
- `POST /` - adiciona uma nota via body JSON `{ "valor": 18 }`
- `POST /:valor` - adiciona uma nota via parâmetro
- `PATCH /:pos` - atualiza a nota na posição via body JSON `{ "valor": 19 }`
- `DELETE /:pos` - remove a nota na posição indicada
- `DELETE /` - remove todas as notas

## Execução

```bash
npm install
npm start
```

O servidor roda em `http://localhost:3000`.

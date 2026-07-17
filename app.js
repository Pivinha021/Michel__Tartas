import prompt from 'prompt-sync';
import pg from 'pg';
const { Client } = pg;


// Configuração da conexão
// São as mesmas informações que você usa no pgAdmin!
const client = new Client({
    host:     'localhost',  // onde o banco está rodando
    port:     5432,         // porta padrão do PostgreSQL
    user:     'postgres',   // usuário do banco
    password: 'root',  // a mesma senha que você usa no pgAdmin
    database: 'estoque_db' // o banco que criamos agora pouco
});

async function listarProdutos() {

    try {

        await client.connect();

        const resultado = await client.query(
            'SELECT * FROM estoque ORDER BY tipo, nome'
        );

        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║         ⚗️  LOJA DO ALQUIMISTA VALDRIS              ║');
        console.log('╚════════════════════════════════════════════════════╝\n');

        if (resultado.rows.length === 0) {
            console.log('A loja está vazia no momento.');
        } else {
            resultado.rows.forEach(item => {
                console.log(`[${item.id}] ${item.nome}`);
                console.log(`    Categoria: ${item.categoria} | Preço: R$ ${item.valorunitario} | Saldo: ${item.quantidade}`);                
                console.log('    ─────────────────────────────────────────');
            });
            console.log(`\nTotal de itens: ${resultado.rows.length}`);
        }

    } catch (erro) {

        console.log('❌ Erro ao listar itens:', erro.message);

    } finally {
        console.log("desconectando...");
        await client.end();
    }
    
}

async function cadastrarItem() {

    try {

        await client.connect();

        console.log('\n⚗️  CADASTRAR NOVO ITEM\n');

        const nome = prompt('Nome do produto: ');
        const categoria = prompt('categoria: ');
        const valorUnitario = prompt('valor: ');
        const quantidade = prompt('quantidade: ');

        // Validação básica antes de ir ao banco
        if (!nome || !quantidade || !valorUnitario) {
            console.log('❌ Nome, quantidade e valor unitario são obrigatórios.');
            return; // sai da função sem ir ao banco
        }

        const resultado = await client.query(
            `INSERT INTO produto (nome, categoria, quantidade, valorunitario)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nome, categoria, quantidade, valorUnitario]
        );

        console.log('\n✅ Item cadastrado com sucesso!');
        console.log(`   ID gerado pelo banco: ${resultado.rows[0].id}`);
        console.log(`   ${resultado.rows[0].nome} adicionado à loja.`);

    } catch (erro) {

        console.log('❌ Erro ao cadastrar item:', erro.message);

    } finally {

        await client.end();

    }
}

cadastrarItem();


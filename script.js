let dificuldadeAtual = '';
let questoesAtuais = [];
let questaoAtual = 0;
let acertos = 0;
let respondida = false;

const fetchTrivia = async (dificuldade = '', qtd = 5) => {
    try {
        const difficultyParam = dificuldade ? `&difficulty=${dificuldade}` : '';
        const url = `https://opentdb.com/api.php?amount=${qtd}${difficultyParam}&type=multiple`;
        
        console.log(`Buscando ${qtd} questões de dificuldade: ${dificuldade || 'aleatória'}`);
        
        let resultado = await fetch(url);
        resultado = await resultado.json();

        if (resultado.response_code !== 0) {
            console.error('Erro ao buscar questões:', resultado.response_code);
            return [];
        }

        return resultado.results;
    } catch (e) {
        console.error('Erro na requisição de trivia:', e.message);
        return [];
    }
};

const fetchTradutor = async (texto) => {
    try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=pt-BR&q=${encodeURIComponent(texto)}`;
        let resultado = await fetch(url);
        resultado = await resultado.json();

        return resultado[0][0];
    } catch (e) {
        console.error('Erro na tradução:', e.message);
        return decodeURIComponent(texto);
    }
};

const mudarTela = (screenId) => {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenId).classList.add('active');
};

const voltarAoMenu = () => {
    questaoAtual = 0;
    acertos = 0;
    respondida = false;
    questoesAtuais = [];
    
    mudarTela('difficulty-screen');
};

const iniciarJogo = async (dificuldade) => {
    dificuldadeAtual = dificuldade;
    questaoAtual = 0;
    acertos = 0;
    respondida = false;

    mudarTela('game-screen');

    console.log('Carregando questões...');
    questoesAtuais = await fetchTrivia(dificuldade, 5);

    if (questoesAtuais.length === 0) {
        alert('Erro ao carregar as questões. Tente novamente.');
        voltarAoMenu();
        return;
    }

    console.log(`${questoesAtuais.length} questões carregadas com sucesso`);

    await exibirQuestao();
};

const exibirQuestao = async () => {
    respondida = false;
    const questao = questoesAtuais[questaoAtual];

    document.getElementById('question-counter').textContent = `Questão ${questaoAtual + 1}/5`;
    const progressPercent = ((questaoAtual + 1) / 5) * 100;
    document.getElementById('progress-fill').style.width = progressPercent + '%';

    const questaoTraduzida = await fetchTradutor(questao.question);
    document.getElementById('question-text').textContent = questaoTraduzida;

    const respostas = [...questao.incorrect_answers, questao.correct_answer];
    
    respostas.sort(() => Math.random() - 0.5);

    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';

    const respostaCorretaTraduzida = await fetchTradutor(questao.correct_answer);

    for (const resposta of respostas) {
        const respostaTraduzida = await fetchTradutor(resposta);
        
        const botaoResposta = document.createElement('button');
        botaoResposta.className = 'answer-btn';
        botaoResposta.textContent = respostaTraduzida;
        botaoResposta.onclick = () => verificarResposta(botaoResposta, respostaTraduzida, respostaCorretaTraduzida);
        
        answersContainer.appendChild(botaoResposta);
    }

    document.getElementById('current-score').textContent = acertos;
};

const verificarResposta = async (botao, respostaSelecionada, respostaCorreta) => {
    if (respondida) return;
    respondida = true;

    const botoesResposta = document.querySelectorAll('.answer-btn');
    botoesResposta.forEach(btn => btn.disabled = true);

    const acertou = respostaSelecionada === respostaCorreta;

    if (acertou) {
        botao.classList.add('correct');
        acertos++;
        document.getElementById('current-score').textContent = acertos;
    } else {
        botao.classList.add('incorrect');
        
        botoesResposta.forEach(btn => {
            if (btn.textContent === respostaCorreta) {
                btn.classList.add('correct');
            }
        });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    questaoAtual++;
    if (questaoAtual < 5) {
        await exibirQuestao();
    } else {
        mostrarResultado();
    }
};

const mostrarResultado = () => {
    mudarTela('result-screen');

    const porcentagem = (acertos / 5) * 100;

    let titulo = '';
    let emoji = '';
    let mensagem = '';

    if (porcentagem === 100) {
        titulo = '🏆 Cê é o bichão memo hein!';
        emoji = '🎉';
        mensagem = 'Aulas pai';
    } else if (porcentagem >= 80) {
        titulo = '🌟 Miseravel é um genio!';
        emoji = '😄';
        mensagem = 'Acertô miseravel!! Na proxima ce crava';
    } else if (porcentagem >= 60) {
        titulo = '👍 Ta na media!';
        emoji = '😊';
        mensagem = 'Mais ou menos , mais ou menos!';
    } else if (porcentagem >= 40) {
        titulo = '📚 Errei fui mlk!';
        emoji = '🤔';
        mensagem = 'Bora la campeão, caprichar que na proxima vem ';
    } else {
        titulo = '📉 Stonks Invertido!';
        emoji = '😌';
        mensagem = 'Ai é foda! Presta atençaõ no serviço meu filho';
    }

    document.getElementById('result-title').textContent = titulo;
    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('final-score').textContent = acertos;
    document.getElementById('result-message').textContent = mensagem;
};

const jogarNovamente = async () => {
    await iniciarJogo(dificuldadeAtual);
};

console.log('Trivia Quiz Game carregado com sucesso!');
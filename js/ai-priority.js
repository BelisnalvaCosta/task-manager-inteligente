const aiPriority = {
    // Palavras-chave para cada prioridade
    keywords: {
        alta: [
            'urgente', 'crítico', 'emergência', 'quebrado', 'bug', 'crash',
            'erro', 'falha', 'imediato', 'logo', 'rápido', 'prioridade',
            'importante', 'essencial', 'vital', 'grave', 'severo',
            'down', 'offline', 'não funciona', 'parado'
        ],
        media: [
            'importante', 'melhorar', 'otimizar', 'problema', 'issue',
            'ajuste', 'configurar', 'revisar', 'update', 'upgrade',
            'feature', 'implementar', 'adicionar', 'desenvolver',
            'próxima semana', 'esta semana', 'em breve'
        ],
        baixa: [
            'melhorar', 'futuro', 'depois', 'quando possível', 'pode esperar',
            'documentação', 'limpeza', 'refactor', 'estético', 'cosmético',
            'próximo mês', 'eventualmente', 'consideração', 'sugestão',
            'nice to have', 'desejável'
        ]
    },

    suggestPriority(description) {
        if (!description || description.length === 0) {
            return null;
        }

        const descLower = description.toLowerCase();
        const scores = { alta: 0, media: 0, baixa: 0 };

        // Contar ocorrências de palavras-chave
        Object.keys(this.keywords).forEach(priority => {
            this.keywords[priority].forEach(keyword => {
                if (descLower.includes(keyword)) {
                    scores[priority]++;
                }
            });
        });

        // Encontrar prioridade com maior score
        let maxScore = Math.max(scores.alta, scores.media, scores.baixa);

        if (maxScore === 0) {
            // Se não encontrou palavras-chave, sugerir média
            return { priority: 'media', confidence: 40 };
        }

        let suggestedPriority = 'media';
        if (scores.alta === maxScore && scores.alta > 0) {
            suggestedPriority = 'alta';
        } else if (scores.baixa === maxScore && scores.baixa > scores.alta && scores.baixa > 0) {
            suggestedPriority = 'baixa';
        }

        // Calcular confiança (0-100%)
        const totalScore = scores.alta + scores.media + scores.baixa;
        const confidence = Math.min(100, Math.round((maxScore / totalScore) * 100));

        return {
            priority: suggestedPriority,
            confidence: confidence,
            scores: scores
        };
    },

    // Análise de sentimento simples
    analyzeSentiment(text) {
        const negativeWords = [
            'erro', 'falha', 'problema', 'quebrado', 'não funciona',
            'bug', 'crash', 'urgente', 'crítico', 'emergência'
        ];

        const positiveWords = [
            'melhorar', 'adicionar', 'novo', 'feature', 'aprimorar',
            'otimizar', 'implementar', 'desenvolver', 'create', 'build'
        ];

        const lowerText = text.toLowerCase();
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;

        return {
            sentiment: negativeCount > positiveCount ? 'negative' : 'positive',
            negativeScore: negativeCount,
            positiveScore: positiveCount
        };
    },

    // Estimativa de tempo baseada em descrição
    estimateTime(description) {
        const keywords = {
            '5-min': ['simples', 'rápido', 'um clique', 'ajuste', 'config'],
            '30-min': ['correção', 'fix', 'bug pequeno', 'typo', 'styling'],
            '1-2h': ['feature pequena', 'melhorium', 'otimização'],
            '1-dia': ['feature média', 'integração', 'refactor'],
            '1-semana': ['feature grande', 'sistema', 'arquitetura']
        };

        const descLower = description.toLowerCase();

        for (const [time, keywordList] of Object.entries(keywords)) {
            if (keywordList.some(keyword => descLower.includes(keyword))) {
                return time;
            }
        }

        return '1-2h'; // Padrão
    }
};
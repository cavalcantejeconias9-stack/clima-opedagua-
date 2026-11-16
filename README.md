# Tempo Agora

Aplicação de previsão do tempo criada em HTML, CSS e JavaScript.

## O que ela faz
- Busca o clima por cidade
- Usa a geolocalização do navegador
- Mostra temperatura atual, sensação térmica, umidade, vento e previsão dos próximos dias
- Funciona sem necessidade de chave de API

## Como executar
1. Abra o arquivo `index.html` diretamente no navegador, ou
2. Rode um servidor local simples:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Tecnologias usadas
- HTML
- CSS
- JavaScript
- API Open-Meteo (sem autenticação)

## Dica
A aplicação usa dados públicos do Open-Meteo, então pode haver pequenas variações de clima dependendo da região e do horário da consulta.

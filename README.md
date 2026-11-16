# Clima Agora

Aplicação de previsão do tempo responsiva, com busca por cidade, geolocalização, animações, tema claro/escuro e suporte a instalação como PWA.

## Recursos
- Layout mobile-first para celular, tablet e desktop.
- Clima atual e previsão para cinco dias via Open-Meteo.
- Busca por cidade e opção de usar a localização do dispositivo.
- Alternância de tema claro/escuro, salva no dispositivo.
- Animações suaves com respeito à preferência de movimento reduzido do sistema.
- PWA com manifesto e cache do app shell para abrir a interface offline após a primeira visita. A previsão atual requer conexão.

## Executar localmente
Para testar PWA e service worker, use um servidor local (a API exige conexão à internet):

```bash
python -m http.server 8000
```

Abra http://localhost:8000. Service workers exigem HTTPS ou localhost; abrir `index.html` diretamente por `file://` não ativa os recursos de instalação/offline.

## Instalar
Acesse o site em um navegador compatível e use a opção de instalação exibida pelo navegador ou o botão **Instalar app** quando disponível.

## Tecnologias
HTML, CSS, JavaScript e API pública Open-Meteo (sem chave de API).

# DUO Konvooi-quiz (losse versie)

Een kleine quiz-app zonder externe packages. Elke gsm opent de link, kiest Team 1, 2 of 3 en antwoordt. Jij logt in als quizmaster met een pincode, opent de vragen, keurt antwoorden goed en ziet wie het snelst was.

## Starten op je laptop (om te testen)
1. Installeer Node.js 18 of nieuwer.
2. Open een terminal in deze map en run: `HOST_PIN=kies-een-pincode node server.js` (Windows PowerShell: `$env:HOST_PIN="kies-een-pincode"; node server.js`)
3. Open http://localhost:3000. Open een tweede venster als team om te testen.

## Online zetten (aanrader: zodat het onderweg werkt)
De laptop zelf is geen goede server onderweg, want de gsm's zitten op 4G. Zet de app op een gratis host met Node:
- **Render.com**: nieuwe "Web Service" vanaf een GitHub-repo met deze map. Build command leeg, start command `node server.js`. Voeg de omgevingsvariabele `HOST_PIN` toe.
- **Fly.io, Railway** of eender welke host met Docker: gebruik de meegeleverde Dockerfile.
Je krijgt een link als `https://jouw-quiz.onrender.com`. Zet de link in de WhatsApp-groep. Een gratis plan kan na een tijd slapen: open de link ruim vooraf zodat de server wakker is.

## Aanpassen
- Teamnamen: `config.json` (precies drie namen).
- Vragen en antwoorden: `questions.json` (velden `r` = etappe, `q` = vraag, `a` = antwoord, enkel voor jou). Herstart de server na een wijziging.
- Pincode: omgevingsvariabele `HOST_PIN` (standaard `2cv`, verander dat).
- De stand en antwoorden worden bewaard in `data.json`. Wissen kan met "Quiz opnieuw beginnen" op het quizmasterscherm.

## Hoe het werkt
`server.js` houdt de toestand bij en stuurt elke wijziging live naar alle gsm's (Server-Sent Events). `public/index.html` is de volledige app. Antwoorden staan alleen op de server en worden pas getoond als jij "Toon antwoord" tikt.

## Let op
- De pincode wordt onversleuteld verstuurd; het is een spel onder vrienden. Gebruik online bij voorkeur een https-adres (Render doet dat automatisch).
- Zonder mobiel bereik in een auto werkt de quiz niet. Neem de papieren kaartjes mee als reserve.

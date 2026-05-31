# StudyTracky (Grupp 7)

En liten Pomodoro-app för plugg. Du kör fokuspass, lägger upp dina kurser, ser statistik
över hur mycket du pluggat och kan till och med generera ett litet AI-quiz på vad du
just nyss läst. Allt sparas lokalt i webbläsaren, det sparas inte någon server, inget konto behövs.

> Det här är ett skolprojekt i kursen Da395B (Flerplattform). Förvänta er alltså inte en
> färdig produkt, detta är en prototyp för att visa att vi fattar ramverket. Låt det inte
> spegla vad gruppmedlemmarna faktiskt klarar av.

## Vad appen gör

- **Timer** – en Pomodoro-timer med fokuspass, korta pauser och långa pauser. Du kan ställa in
  längderna själv och koppla passet till en kurs.
- **Kurser** – lägg till och ta bort kurser, med egen färg och veckomål.
- **Sessioner** – historik över alla pluggpass du kört.
- **Statistik** – total pluggtid, antal pass, tid den här veckan och en stapel per kurs.
- **Quiz** – skriv in ett ämne så genererar Claude (Anthropics AI) fem flervalsfrågor åt dig.
  Kräver att du klistrar in din egen API-nyckel under inställningarna (sparas bara lokalt).

## Teknik

- **React 19** – hela UI:t är byggt med komponenter och hooks (`useState`, `useEffect`, `useRef`).
- **Vite** – dev-server och bygge.
- **localStorage** – all data (kurser, sessioner, inställningar) sparas i webbläsaren. Ingen backend.
- **Claude API** – anropas direkt från frontend för quiz-funktionen.
- Ingen router – vi byter "sida" med en enkel `page`-state i `App.jsx`.

## Kom igång

```bash
npm install
npm run dev      # startar dev-servern
npm run build    # bygger för produktion
```

## Struktur (vem gjorde vad)

| Del                           | Vem     |
| ----------------------------- | ------- |
| App-skal, Nav, Timer, CSS     | Wahid   |
| storage.js, Kurser, Sessioner | Adam    |
| Statistik, Quiz               | Mojtaba |

src/
── App.jsx # håller koll på vald sida + tema
── components/ # Nav, Icons, QuizCard
── lib/ # localStorage-logik + kurs-/sessionssidor
── pages/ # Timer, Statistik, Quiz

## Jämförelse mot andra ramverk/bibliotek

Vi valde **React**, men kollade så klart på alternativen. Här är vår (ganska informella) syn:

### React (det vi körde)

- Enormt ekosystem, finns svar på precis allt på nätet och nästan alla i gruppen hade
  pillat lite med det innan.
- Komponent-tänket gör det lätt att dela upp jobbet – tre personer kunde bygga varsin del
  utan att trampa varandra på tårna.
- Hooks som `useState`/`useEffect` räcker långt för en sån här liten app.
- Det är "bara ett bibliotek", så man får själv välja routing, state management osv. Lite mer
  pusslande än ett ramverk som ger dig allt.
- Man kan lätt skjuta sig själv i foten med t.ex. re-renders och effekter om man inte är med i spelet.

### Vue

- Lättare att komma igång i, mycket pedagogisk dokumentation, och `.vue`-filer som samlar
  HTML/JS/CSS på ett ställe känns rent.
- Reaktivitet "out of the box" – mindre boilerplate än React.
- Mindre community än React (men ändå stort), och färre i gruppen hade kört det.

### Angular

- Ett _helt_ ramverk – routing, formulär, HTTP, allt ingår. Bra för stora team/appar.
- Rejält tungt och brant inlärningskurva (TypeScript, RxJS, dependency injection...).
  Total overkill för en Pomodoro-app som den här.

### Svelte

- Skitsnabbt och nästan ingen boilerplate – kompilerar bort sig själv, så bundlen blir liten.
- Väldigt skön utvecklarupplevelse.
- Minst ekosystem av de fyra och bara eb i gruppen hade erfarenhet. Kändes som en onödig risk
  när deadline tickar.

### Vanilla JS (inget ramverk alls)

- Inga dependencies, inget att lära sig.
- Hade blivit jobbigt fort. Att hålla UI:t i synk med datan (timer som tickar, sidbyten,
  statistik som uppdateras) för hand med `document.querySelector` är precis det problemet som
  React löser åt oss.

### Varför React till slut?

Det var helt enkelt bästa kombon av _"vi kan det här redan"_, _"det finns hjälp att googla"_ och
_"komponenter gör att vi kan dela upp arbetet"_. För en liten app i ett skolprojekt med kort
deadline kändes Angular för mastigt, Svelte för okänt, och vanilla JS för bökigt. Vue hade
funkat fint, det blev React mest för att vi redan var bekväma med det. Här är en källa om varför vi valde React över t.ex. Angular
https://www.geeksforgeeks.org/angular-js/why-use-react-instead-of-other-frameworks-like-angular/

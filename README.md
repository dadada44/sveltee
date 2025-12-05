# Sveltee - Aplikace pro studenty s AI chatbotem

Webová aplikace pro studenty, která umožňuje nahrávat PDF soubory (učebnice, pracovní sešity) a automaticky generovat přehledné zápisky pomocí AI. Aplikace obsahuje AI chatbot, který pomáhá studentům s učením.

## Funkce

- 📄 Nahrávání PDF souborů
- 🤖 AI chatbot pro pomoc s učením (floating chat button)
- 📝 Automatické generování zápisků z PDF
- 💬 Interaktivní AI asistent dostupný na všech stránkách

## Nastavení

### Proměnné prostředí

Vytvořte soubor `.env` v kořenovém adresáři projektu s následujícími proměnnými:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/database_name

# AI Provider - DOPORUČENO: Groq (FREE tier, rychlý)
# Získejte zdarma na: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# AI Provider - Alternativa: OpenAI (placené)
# Získejte na: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

**💡 Tip:** Aplikace automaticky použije Groq, pokud je nastavený `GROQ_API_KEY`. Pokud Groq není dostupný, použije OpenAI. Groq má **zdarma** velmi rychlý a kvalitní AI model!

### Instalace závislostí

```sh
npm install
```

## Vývoj

Spusťte vývojový server:

```sh
npm run dev

# nebo otevřete aplikaci v novém prohlížeči
npm run dev -- --open
```

## AI Chatbot

Aplikace obsahuje AI chatbot, který je dostupný na všech stránkách prostřednictvím floating tlačítka v pravém dolním rohu. Chatbot pomáhá studentům s:
- Porozuměním učebnicím a pracovním sešitům
- Vysvětlením složitých konceptů
- Odpověďmi na otázky k učivu

Chatbot API endpoint: `/api/chat`

### Jak získat FREE Groq API klíč:

1. Jděte na https://console.groq.com/
2. Přihlaste se pomocí Google/GitHub účtu
3. V menu vyberte "API Keys"
4. Klikněte na "Create API Key"
5. Zkopírujte klíč a vložte ho do `.env` souboru jako `GROQ_API_KEY=váš_klíč`

Groq poskytuje **zdarma** velmi rychlý AI model (Llama 3.1) bez nutnosti platby!

## Build

Vytvoření produkční verze aplikace:

```sh
npm run build
```

Náhled produkční verze:

```sh
npm run preview
```

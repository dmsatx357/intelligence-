# Intelligence Into Imagination

A responsive creative experiment that turns one real-world intelligence input into a connected **Intelligence → Insight → Imagination** progression.

## What works now
- Full responsive website and interaction design
- Required input, example prompts and three creative modes
- Generate, Another Leap, Take It Further, Copy/Share and Try Another
- Loading, validation and friendly error states
- **Preview mode** runs immediately with clearly labeled sample logic
- **Azure OpenAI mode** calls the approved model from the Node server; the credential never reaches the browser

## Run it (about 60 seconds)
1. Install Node.js 20 or newer.
2. Unzip this folder and open a terminal in it.
3. Run `npm start`.
4. Open `http://localhost:3000`.

No package installation is required.

## Connect the real AI
For the included Azure configuration, provide an Azure OpenAI resource, model deployment and server-side credential. Never put the key in `public/app.js` or any browser file.

macOS/Linux:
```bash
export AI_PROVIDER=azure
export AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
export AZURE_OPENAI_API_KEY=YOUR-SERVER-SIDE-SECRET
export AZURE_OPENAI_DEPLOYMENT=YOUR-DEPLOYMENT
export AZURE_OPENAI_API_VERSION=2024-10-21
npm start
```

PowerShell:
```powershell
$env:AI_PROVIDER='azure'
$env:AZURE_OPENAI_ENDPOINT='https://YOUR-RESOURCE.openai.azure.com'
$env:AZURE_OPENAI_API_KEY='YOUR-SERVER-SIDE-SECRET'
$env:AZURE_OPENAI_DEPLOYMENT='YOUR-DEPLOYMENT'
$env:AZURE_OPENAI_API_VERSION='2024-10-21'
npm start
```

The server requests structured JSON and validates the `intelligence`, `insight`, and `imagination` fields before the browser renders them.

## Recommended internal deployment
**Simplest production path:** Azure App Service (Node 20) with Microsoft Entra authentication enabled, and secrets stored as App Service application settings or Azure Key Vault references.

1. Put this code in a private GitHub repository.
2. Create an Azure App Service using Node 20 LTS.
3. Connect App Service Deployment Center to the private repository.
4. Add the five environment variables above as server-side application settings.
5. Turn on App Service Authentication and require your Microsoft Entra ID sign-in if using the internal Azure deployment path.
6. Restrict access to the intended tenant and complete the required security/data-governance review.
7. Run acceptance tests: all three modes, empty/long input, failed-model response, mobile layout, keyboard navigation and copy behavior.

## Copilot Studio alternative
Copilot Studio is approved and can publish agents to websites, but this experience is a custom, highly art-directed interface rather than a conventional chat. Use Copilot Studio only if you want it to own the orchestration. Expose a reviewed agent or flow through a secured server-side integration. Do not call an unauthenticated bot endpoint directly from the browser.

## Important release note
Preview mode is intentionally labeled and does **not** pretend to be live AI. A production release is complete only after the approved model/service is provisioned and any required connector/data-governance review is complete, and changes `AI_PROVIDER` to `azure`.

# dansonofbass.github.io
<DAN/> : Dan's Portfolio Site

## Referrer sanitization test

1. Run a local HTTP server (not file://):

   - Python 3: `python -m http.server 8080`
   - Node: `npx http-server -p 8080 --no-dotfiles`

2. Open `http://localhost:8080/` in the browser.

3. Open DevTools → Network, keep “Preserve log” enabled.

4. Click any project link (button labeled "Details").

5. In the Network panel, select the first request to the external domain and inspect Headers. Confirm that the "Referer" header is absent.

6. Push to GitHub Pages and re-test on the deployed site similarly. The `meta name="referrer" content="no-referrer"` and the `redirect.html` bridge ensure no Referer is sent.

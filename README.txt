FÚTBOLMX V4 PRO

Contenido:
- Rediseño profesional completo y responsive.
- Home tipo portal deportivo con centro de partido, próximos encuentros, tabla, clubes y herramientas.
- Páginas independientes: Partidos, Tabla, Equipos, Equipo y Simulador.
- API-Football protegida mediante función serverless de Vercel.
- Fallback de demostración si la API no está configurada.
- robots.txt y sitemap.xml servidos mediante funciones.
- Headers básicos de seguridad.

DESPLIEGUE EN VERCEL
1. Sube todos los archivos de esta carpeta a un repositorio.
2. Importa el repositorio como proyecto en Vercel.
3. En Settings > Environment Variables agrega:
   API_FOOTBALL_KEY = TU_NUEVA_CLAVE
4. Haz Redeploy.

Opcional:
API_FOOTBALL_LEAGUE_ID
API_FOOTBALL_SEASON

No pongas la API key dentro de archivos .js públicos.

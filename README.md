### How to run this app
`HINT: For easier application setup I has kept the .env file in directory and commited it to the repository. Don't repeat it in your real projects.`
1. Clone repository at your local machine.
2. Make sure you have `docker` and `docker-compose` commands available. Recommended versions: `docker version 18+` and `docker-compose version 1.24.1`
3. Make sure `.env` variables are correctly set. Use .env.example 
4. Make sure that port `3002` is available. Main application will be run on that port. You can specify other port as an environment variable.
5. Run `docker-compose up -d`
6. Enjoy. For general overview take a look at API documentation: `http://localhost:3002/api-docs`

### How to authorize when playing with api via swagger-ui
1. Use login method to obtain a JWT token. `HINT: Example credentials in user.service.ts`
2. Click `authorize` button at the right-top corner of swagger-ui subpage(`http://localhost:3002/api-docs`).
3. Paste `Bearer <OBTAINED TOKEN HERE>` into input field.
4. Click authorize. Now secured endpoints will be available for you. After page refresh you will have to repeat the procedure.

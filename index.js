const { getJoyas, HATEOAS, getFilter } = require('./query.js');
const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server on ${PORT}`);
});
app.use(express.json());

const reportQuery = async (req, res, next) => {
	const params = req.query;
	const url = req.url;
	console.log(
		`
Hoy ${new Date()}
Se ha recibido una consulta en la ruta ${url}
con los parámetros:`,
		params
	);
	next(); 
};

/* app.use((req, res, next) => {
	const params = req.params;
	const url = req.url;

	console.log(
		`Se ha ingresado a la ruta: ${url}
Con los parametros:  `,
		params
	);

	return next();
}); */

app.get('/joyas', reportQuery, async (req, res) => {
	try {
		const query = req.query;
		const joyas = await getJoyas(query);
		const hateoas = HATEOAS(joyas);
		res.json(hateoas);
	} catch (error) {
		res.status(500).json(error.message);
	}
});

app.get('/joyas/filtros', reportQuery, async (req, res) => {
	try {
		const query = req.query;
		const joyas = await getFilter(query);
		res.json(joyas);
	} catch (error) {
		res.status(500).json(error.message);
	}
});

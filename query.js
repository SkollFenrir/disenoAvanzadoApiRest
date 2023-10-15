const { Pool } = require('pg');
const format = require('pg-format');

const obj = {
	host: 'localhost',
	user: 'postgres',
	password: 'postgres',
	database: 'joyas',
	allowExitOnIdle: true,
};
const pool = new Pool(obj);
/* const pool = new Pool({
	host: 'localhost',
	user: 'postgres',
	password: 'postgres',
	database: 'joyas',
	allowExitOnIdle: true,
});  comentado para modularizar */
/* const getJoyas = async () => {
	const { rows: joyas } = await pool.query('SELECT * FROM inventario');
	return joyas;
}; */

const getJoyas = async ({ limits = 10, order_by = 'id_ASC', page = 1 }) => {
	const [campo, direc] = order_by.split('_');
	const offset = (page - 1) * limits;
	const queryFormat = format(
		'SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s',
		campo,
		direc,
		limits,
		offset
	);
    //console.log(queryFormat)
	const { rows: joyas } = await pool.query(queryFormat);
	return joyas;
};

const HATEOAS = (joyas) => {
	const result = joyas.map((joya) => {
		return {
			name: joya.nombre,
			href: `/joyas/joya/${joya.id}`,
		};
	});
	const totalJoyas = joyas.length;
	const stockTotal = joyas.reduce((total, i) => total + i.stock, 0);
	const HATEOAS = {
		totalJoyas,
		stockTotal,
		result,
	};
	return HATEOAS;
};

const getFilter = async ({ precio_max, precio_min, categoria, metal }) => {
	let filter = [];
	let values = [];
	const addFilter = (campo, comparador, valor) => {
		values.push(valor);
		const { length } = filter;
		filter.push(`${campo} ${comparador} $${length + 1}`);
	};
	if (precio_max) addFilter('precio', '<=', precio_max);
	if (precio_min) addFilter('precio', '>=', precio_min);
	if (categoria) addFilter('categoria', '=', categoria);
	if (metal) addFilter('metal', '=', metal);

	let query = 'SELECT * FROM inventario ';
	if (filter.length > 0) {
		filter = filter.join(' AND ');
		query += ` WHERE ${filter}`;
	}
    //console.log(values, query)
	const { rows: joyas } = await pool.query(query, values);
	return joyas;
};
module.exports = { getJoyas, HATEOAS, getFilter };

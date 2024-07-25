export const getCart = async (db: any, userid: number) => {
  const queryCart = `SELECT * FROM cart WHERE userid = $1`;
  const valuesCart = [userid];
  const resultCart = await db.query(queryCart, valuesCart);
  return resultCart.rows[0];
};

export const getProductsFromCart = async (db: any, productId: number) => {
  const queryCart = `SELECT * FROM products WHERE id = ANY($1::int[]);`;
  const valuesCart = [productId];
  const resultCart = await db.query(queryCart, valuesCart);
  return resultCart.rows;
};

export const addProductToCart = async (db: any, cartId: number, productId: number) => {
  const queryCart = `UPDATE cart SET productids = array_append(productids, $1) WHERE id = $2`;
  const valuesCart = [productId, cartId];
  await db.query(queryCart, valuesCart);
};

export const removeProductFromCart = async (db: any, cartId: number, productId: number) => {
  const queryCart = `UPDATE cart SET productids = array_remove(productids, $1) WHERE id = $2`;
  const valuesCart = [productId, cartId];
  await db.query(queryCart, valuesCart);
};

export const clearCart = async (db: any, cartId: number) => {
  const queryCart = `UPDATE cart SET productids = '{}' WHERE id = $1`;
  const valuesCart = [cartId];
  await db.query(queryCart, valuesCart);
};

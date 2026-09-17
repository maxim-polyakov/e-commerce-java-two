import cartStore from './CartStore';

describe('CartStore', () => {
  beforeEach(() => {
    cartStore.clearCart();
    if (cartStore.isOpen) cartStore.toggleCart();
    window.alert = jest.fn();
  });

  test('merges duplicate products and calculates totals', () => {
    cartStore.addToCart({ id: 7, name: 'Keyboard', price: 75 });
    cartStore.addToCart({ id: 7, name: 'Keyboard', price: 75 });

    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0].quantity).toBe(2);
    expect(cartStore.totalItems).toBe(2);
    expect(cartStore.totalPrice).toBe(150);
    expect(cartStore.getItemTotal(7)).toBe(150);
  });

  test('updating a quantity below one removes the product', () => {
    cartStore.addToCart({ id: 1, name: 'Mouse', price: 20 });
    cartStore.addToCart({ id: 2, name: 'Monitor', price: 200 });

    cartStore.updateQuantity(1, 0);

    expect(cartStore.items.map((item) => item.id)).toEqual([2]);
    expect(cartStore.totalItems).toBe(1);
    expect(cartStore.totalPrice).toBe(200);
  });

  test('toggleCart changes visibility without mutating cart contents', () => {
    cartStore.addToCart({ id: 3, name: 'Desk', price: 300 });

    cartStore.toggleCart();
    expect(cartStore.isOpen).toBe(true);
    expect(cartStore.items).toHaveLength(1);

    cartStore.toggleCart();
    expect(cartStore.isOpen).toBe(false);
    expect(cartStore.items).toHaveLength(1);
  });
});

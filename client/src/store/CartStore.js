import { makeAutoObservable } from 'mobx';

class CartStore {
    items = [];
    isOpen = false;

    constructor() {
        makeAutoObservable(this);
    }

    // Добавить товар в корзину
    addToCart = (product) => {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            alert(`Товар "${product.name}" добавлен в корзину! Теперь количество: ${existingItem.quantity}`);
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
            alert(`Товар "${product.name}" добавлен в корзину!`);
        }
    }

    // Удалить товар из корзины
    removeFromCart = (productId) => {
        this.items = this.items.filter(item => item.id !== productId);
    }

    // Изменить количество товара
    updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }

    // Очистить корзину
    clearCart = () => {
        this.items = [];
    }

    // Открыть/закрыть корзину
    toggleCart = () => {
        this.isOpen = !this.isOpen;
    }

    // Вычислить общую стоимость
    get totalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Вычислить общее количество товаров
    get totalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Получить общую стоимость конкретного товара
    getItemTotal = (productId) => {
        const item = this.items.find(item => item.id === productId);
        return item ? item.price * item.quantity : 0;
    }
}

const cartStore = new CartStore();
export default cartStore;
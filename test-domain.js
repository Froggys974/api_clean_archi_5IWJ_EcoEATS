"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const price_value_object_1 = require("./src/domain/value-objects/price.value-object");
const coordinates_value_object_1 = require("./src/domain/value-objects/coordinates.value-object");
const address_value_object_1 = require("./src/domain/value-objects/address.value-object");
const distance_value_object_1 = require("./src/domain/value-objects/distance.value-object");
const allergen_value_object_1 = require("./src/domain/value-objects/allergen.value-object");
const dish_entity_1 = require("./src/domain/entities/restaurant/dish.entity");
const restaurant_entity_1 = require("./src/domain/entities/restaurant/restaurant.entity");
const cart_entity_1 = require("./src/domain/entities/order/cart.entity");
const cart_item_entity_1 = require("./src/domain/entities/order/cart-item.entity");
const email_value_object_1 = require("./src/domain/value-objects/email.value-object");
const phone_value_object_1 = require("./src/domain/value-objects/phone.value-object");
console.log('🧪 Testing EcoEats Domain Layer...\n');
// Test 1: Price Value Object
console.log('✅ Test 1: Price Value Object');
const price1Result = price_value_object_1.Price.create(15.99);
if (!price1Result.success) {
    console.error('❌ Failed to create price');
    process.exit(1);
}
const price1 = price1Result.data;
console.log(`   Price created: ${price1.toString()}`);
const price2Result = price_value_object_1.Price.create(5.50);
if (!price2Result.success) {
    console.error('❌ Failed to create price');
    process.exit(1);
}
const price2 = price2Result.data;
const totalResult = price1.add(price2);
if (!totalResult.success) {
    console.error('❌ Failed to add prices');
    process.exit(1);
}
console.log(`   ${price1.toString()} + ${price2.toString()} = ${totalResult.data.toString()}`);
// Test 2: Coordinates and Distance
console.log('\n✅ Test 2: Coordinates and Distance');
const parisResult = coordinates_value_object_1.Coordinates.create(48.8566, 2.3522);
const lyonResult = coordinates_value_object_1.Coordinates.create(45.7640, 4.8357);
if (!parisResult.success || !lyonResult.success) {
    console.error('❌ Failed to create coordinates');
    process.exit(1);
}
const paris = parisResult.data;
const lyon = lyonResult.data;
const distance = paris.distanceTo(lyon);
console.log(`   Distance Paris to Lyon: ${distance} km (as the crow flies)`);
// Test 3: Address
console.log('\n✅ Test 3: Address');
const addressResult = address_value_object_1.Address.create({
    street: '123 Rue de Rivoli',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    coordinates: paris,
});
if (!addressResult.success) {
    console.error('❌ Failed to create address');
    process.exit(1);
}
const address = addressResult.data;
console.log(`   Address: ${address.getFullAddress()}`);
// Test 4: Allergen
console.log('\n✅ Test 4: Allergen');
const glutenResult = allergen_value_object_1.Allergen.create('GLUTEN');
const nutsResult = allergen_value_object_1.Allergen.create('NUTS');
if (!glutenResult.success || !nutsResult.success) {
    console.error('❌ Failed to create allergen');
    process.exit(1);
}
console.log(`   Allergens: ${glutenResult.data.toString()}, ${nutsResult.data.toString()}`);
// Test 5: Dish Entity with Stock Management
console.log('\n✅ Test 5: Dish Entity with Stock Management');
const dishPriceResult = price_value_object_1.Price.create(12.99);
if (!dishPriceResult.success) {
    console.error('❌ Failed to create dish price');
    process.exit(1);
}
const dish = dish_entity_1.Dish.create({
    id: 'dish-001',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with tomato and mozzarella',
    price: dishPriceResult.data,
    allergens: [glutenResult.data],
    dailyStock: 50,
    category: 'Pizza',
});
console.log(`   Dish: ${dish.name} - ${dish.price.toString()}`);
console.log(`   Stock: ${dish.availableStock}/${dish.dailyStock}`);
console.log(`   Is orderable: ${dish.isOrderable()}`);
// Decrease stock
try {
    const updatedDish = dish.decreaseStock(5);
    console.log(`   After ordering 5: ${updatedDish.availableStock}/${updatedDish.dailyStock}`);
}
catch (error) {
    console.error(`❌ Failed to decrease stock: ${error}`);
    process.exit(1);
}
// Test 6: Restaurant Entity
console.log('\n✅ Test 6: Restaurant Entity');
const emailResult = email_value_object_1.Email.create('contact@pizzeria.fr');
const phoneResult = phone_value_object_1.Phone.create('+33123456789');
if (!emailResult.success || !phoneResult.success) {
    console.error('❌ Failed to create email or phone');
    process.exit(1);
}
const restaurant = restaurant_entity_1.Restaurant.create({
    id: 'resto-001',
    ownerId: 'owner-001',
    name: 'La Bella Pizza',
    description: 'Authentic Italian pizzeria',
    address: address,
    phone: phoneResult.data,
    cuisineType: 'Italian',
    openingHours: [
        { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00' }, // Monday
        { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00' }, // Tuesday
    ],
    status: 'CLOSED',
});
console.log(`   Restaurant: ${restaurant.name}`);
console.log(`   Cuisine: ${restaurant.cuisineType}`);
console.log(`   Status: ${restaurant.status}`);
const openRestaurant = restaurant.open();
console.log(`   After opening: ${openRestaurant.status}`);
// Test 7: Cart with Single Restaurant Rule
console.log('\n✅ Test 7: Cart with Single Restaurant Rule');
const cart = cart_entity_1.Cart.create({
    id: 'cart-001',
    clientId: 'client-001',
});
console.log(`   Cart created for client: ${cart.clientId}`);
console.log(`   Is empty: ${cart.isEmpty()}`);
const cartItemPriceResult = price_value_object_1.Price.create(12.99);
if (!cartItemPriceResult.success) {
    console.error('❌ Failed to create cart item price');
    process.exit(1);
}
const cartItem1 = cart_item_entity_1.CartItem.create({
    id: 'item-001',
    dishId: 'dish-001',
    dishName: 'Margherita Pizza',
    dishPrice: cartItemPriceResult.data,
    quantity: 2,
});
const cartWithItem = cart.addItem(cartItem1, 'resto-001');
console.log(`   Added ${cartItem1.quantity}x ${cartItem1.dishName}`);
console.log(`   Total items: ${cartWithItem.getTotalItems()}`);
console.log(`   Total price: ${cartWithItem.getTotalPrice().toString()}`);
console.log(`   Restaurant ID: ${cartWithItem.restaurantId}`);
// Test 8: Single Restaurant Rule Violation
console.log('\n✅ Test 8: Testing Single Restaurant Rule');
const cartItem2PriceResult = price_value_object_1.Price.create(8.50);
if (!cartItem2PriceResult.success) {
    console.error('❌ Failed to create cart item price');
    process.exit(1);
}
const cartItem2 = cart_item_entity_1.CartItem.create({
    id: 'item-002',
    dishId: 'dish-002',
    dishName: 'Sushi Roll',
    dishPrice: cartItem2PriceResult.data,
    quantity: 1,
});
try {
    // This should throw DifferentRestaurantInCartError
    cartWithItem.addItem(cartItem2, 'resto-002');
    console.error('❌ Should have thrown DifferentRestaurantInCartError');
    process.exit(1);
}
catch (error) {
    if (error instanceof Error) {
        console.log(`   ✓ Correctly rejected item from different restaurant`);
        console.log(`   Error: ${error.name}`);
    }
}
// Test 9: Distance Calculation
console.log('\n✅ Test 9: Distance Calculation');
const restaurantCoords = coordinates_value_object_1.Coordinates.create(48.8566, 2.3522);
const clientCoords = coordinates_value_object_1.Coordinates.create(48.8606, 2.3376);
if (!restaurantCoords.success || !clientCoords.success) {
    console.error('❌ Failed to create coordinates');
    process.exit(1);
}
const deliveryDistance = restaurantCoords.data.distanceTo(clientCoords.data);
console.log(`   Delivery distance: ${deliveryDistance} km`);
const distanceResult = distance_value_object_1.Distance.create(deliveryDistance);
if (!distanceResult.success) {
    console.error('❌ Failed to create distance');
    process.exit(1);
}
console.log(`   Distance object: ${distanceResult.data.toString()}`);
console.log(`   In meters: ${distanceResult.data.getMeters()} m`);
// Test 10: Delivery Fee Calculation Simulation
console.log('\n✅ Test 10: Delivery Fee Calculation');
const pickupFeeResult = price_value_object_1.Price.create(2.50);
const pricePerKmResult = price_value_object_1.Price.create(1.50);
if (!pickupFeeResult.success || !pricePerKmResult.success) {
    console.error('❌ Failed to create prices');
    process.exit(1);
}
const distanceFeeResult = pricePerKmResult.data.multiply(deliveryDistance);
if (!distanceFeeResult.success) {
    console.error('❌ Failed to calculate distance fee');
    process.exit(1);
}
const totalDeliveryFeeResult = pickupFeeResult.data.add(distanceFeeResult.data);
if (!totalDeliveryFeeResult.success) {
    console.error('❌ Failed to calculate total delivery fee');
    process.exit(1);
}
console.log(`   Pickup fee: ${pickupFeeResult.data.toString()}`);
console.log(`   Distance fee: ${distanceFeeResult.data.toString()} (${pricePerKmResult.data.toString()}/km × ${deliveryDistance} km)`);
console.log(`   Total delivery fee: ${totalDeliveryFeeResult.data.toString()}`);
console.log('\n🎉 All domain tests passed successfully!');
console.log('\n📊 Summary:');
console.log('   ✅ Value Objects: Price, Coordinates, Address, Distance, Allergen');
console.log('   ✅ Entities: Dish, Restaurant, Cart, CartItem');
console.log('   ✅ Business Rules: Single restaurant per cart, Stock management');
console.log('   ✅ Calculations: Distance (Haversine), Delivery fees');
//# sourceMappingURL=test-domain.js.map
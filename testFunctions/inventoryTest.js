let inventory = ['Repair Kit', 'Scrap Metal', 'Scrap Metal', 'Particle Battery', 'Thick Carbon Coating', 'Scrap Metal', 'Repair Kit'];
let newInv = inventory.sort();
let itemCount = 1;
console.log('You have the following items in your bag:');
for (let i = 0; i < newInv.length; i++){
    if (newInv[i] !== newInv[i+1]) {
        console.log(`  ${itemCount} ${newInv[i]}`)
        itemCount = 1
    } else {
        itemCount += 1;
    }
}
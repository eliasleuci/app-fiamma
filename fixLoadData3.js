const fs = require('fs');
let file = 'c:/Users/Elias/.gemini/antigravity/scratch/app Fiamma/context/ConfigContext.tsx';
let data = fs.readFileSync(file);
let text = '';
if (data[0] === 0xFF && data[1] === 0xFE) {
  text = data.toString('utf16le');
} else {
  text = data.toString('utf8');
}

// Ensure it's not double converted
if (text.includes('\0')) text = text.replace(/\0/g, '');

const fetchTarget = "                      supabase.from('expenses').select('*').order('created_at', { ascending: false })";
const fetchReplacement = `                      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
                      supabase.from('client_profiles').select('*').order('created_at', { ascending: false }),
                      supabase.from('inventory_categories').select('*'),
                      supabase.from('inventory_items').select('*').order('created_at', { ascending: false }),
                      supabase.from('service_inventory_costs').select('*')`;

const destructTarget = `                      { data: expensesData }
                  ]) => {`;
const destructReplacement = `                      { data: expensesData },
                      { data: clientProfilesData },
                      { data: invCategoriesData },
                      { data: invItemsData },
                      { data: svcInvCostsData }
                  ]) => {`;

const mapTarget = `                      if (expensesData) {
                          setExpenses(expensesData.map((e: any) => ({
                              ...e,
                              categoryId: e.category_id,
                              categoryName: e.category_name,
                              paymentMethod: e.payment_method,
                              createdAt: e.created_at
                          })));
                      }`;

const mapReplacement = `                      if (expensesData) {
                          setExpenses(expensesData.map((e: any) => ({
                              ...e,
                              categoryId: e.category_id,
                              categoryName: e.category_name,
                              paymentMethod: e.payment_method,
                              createdAt: e.created_at
                          })));
                      }
                      if (clientProfilesData) setClientProfiles(clientProfilesData);
                      if (invCategoriesData) setInventoryCategories(invCategoriesData);
                      if (invItemsData) {
                          setInventoryItems(invItemsData.map((i: any) => ({
                              ...i,
                              categoryId: i.category_id,
                              categoryName: i.category_name,
                              currentQuantity: i.current_quantity,
                              costPerUnit: i.cost_per_unit,
                              alertThreshold: i.alert_threshold,
                              lastRestockDate: i.last_restock_date,
                              supplier: i.supplier,
                              createdAt: i.created_at
                          })));
                      }
                      if (svcInvCostsData) {
                          setServiceInventoryCosts(svcInvCostsData.map((s: any) => ({
                              ...s,
                              serviceId: s.service_id,
                              inventoryItemId: s.inventory_item_id,
                              inventoryItemName: s.inventory_item_name,
                              quantityUsed: s.quantity_used,
                              costPerUnit: s.cost_per_unit
                          })));
                      }`;

if (!text.includes(fetchTarget)) {
  console.log("Could not find fetchTarget in file!");
  // log a chunk to debug
  console.log(text.substring(text.indexOf("expenses"), text.indexOf("expenses") + 200));
} else {
  text = text.replace(fetchTarget, fetchReplacement);
  text = text.replace(destructTarget, destructReplacement);
  text = text.replace(mapTarget, mapReplacement);

  fs.writeFileSync(file, text, 'utf8');
  console.log('Done!');
}

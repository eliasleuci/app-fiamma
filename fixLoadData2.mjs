import fs from 'fs';
const file = 'c:/Users/Elias/.gemini/antigravity/scratch/app Fiamma/context/ConfigContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const fetchTarget = `                      supabase.from('expenses').select('*').order('created_at', { ascending: false })`;
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

const mappingTarget = `                      if (expensesData) {
                          setExpenses(expensesData.map((e: any) => ({
                              ...e,
                              categoryId: e.category_id,
                              categoryName: e.category_name,
                              paymentMethod: e.payment_method,
                              createdAt: e.created_at
                          })));
                      }
                  });`;
const mappingReplacement = `                      if (expensesData) {
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
                      }
                  });`;

content = content.replace(fetchTarget, fetchReplacement);
content = content.replace(destructTarget, destructReplacement);
content = content.replace(mappingTarget, mappingReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ConfigContext.tsx!');

import Store from "../../models/storeModels/StoreSchema.js"

const updateTheProfile=async(req,res)=>{
try {
    const { storeId } = req.params;
    const { storeName, email, country, city, postalCode } = req.body;

    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.storeName = storeName || store.storeName;
    store.email = email || store.email;
    store.country = country || store.country;
    store.city = city || store.city;
    store.postalCode = postalCode || store.postalCode;


    if (req.file) {
      store.profilePicture = req.file.path; 
    }

    await store.save();
    res.status(200).json({ message: 'Profile updated successfully', store });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
}
export default {updateTheProfile}
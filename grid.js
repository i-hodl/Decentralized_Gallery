 // Constants
 const BASE_URL = 'https://api.rarible.org/v0.1/';
 let RARIBLE_API_KEY;
 let CONTRACT_ADDRESS;
 const headers = {
     'Authorization': '',
     'Accept': 'application/json',
     'X-API-KEY': ''
 };
 
 // Convert IPFS URL to HTTP URL
 function convertIPFSToHTTP(ipfsUrl) {
     return ipfsUrl.replace(/^ipfs:\/\/(ipfs\/)?/, "https://ipfs.io/ipfs/");
 }
 
 // Function to animate the gallery title
 async function animateTitle() {
     const title = document.getElementById('gallery-title');
     title.classList.remove('hidden');
     title.classList.add('pulse');
 
     // Add char index for staggering animation
     Array.from(title.children).forEach((span, index) => {
       span.style.setProperty('--char-index', index);
     });
     
     // Wait for animation to complete
     await new Promise(resolve => setTimeout(resolve, 5000)); // Hold for 5 sec
     
     title.classList.add('hidden'); // Hide the title
   }
   
   
 
 
 // Fetch all items in the collection with pagination
 async function fetchAllItemsInCollection(limit = 10) {
     const url = `${BASE_URL}items/byCollection?collection=ETHEREUM%3A${CONTRACT_ADDRESS}&limit=${limit}`;
     try {
         const response = await fetch(url, { headers: headers });
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error(`Failed to fetch items for collection: ${CONTRACT_ADDRESS}`, error);
         return null;
     }
 }
 
 // Display a single NFT on the page
 async function displayNFT(nftData) {
     // Validation
     if (!nftData || !nftData.meta || !nftData.meta.name) {
         console.error(`Incomplete data for item: ${nftData?.id}`, nftData);
         return;
     }
 
     // Image URL
     let image_url;
     if (nftData.meta.originalMetaUri) {
         const metaUri = convertIPFSToHTTP(nftData.meta.originalMetaUri);
         const imageResponse = await fetch(metaUri);
         if (!imageResponse.ok) {
             console.error(`Failed to fetch image data for item: ${nftData.id}`, imageResponse.status);
             return;
         }
         const imageData = await imageResponse.json();
         if (!imageData || !imageData.image) {
             console.error(`Invalid image data for item: ${nftData.id}`);
             return;
         }
         image_url = imageData.image;
     } else if (nftData.meta.content && Array.isArray(nftData.meta.content)) {
         const contentObj = nftData.meta.content.find(content => content['@type'] === "IMAGE");
         if (contentObj && contentObj.url) {
             image_url = contentObj.url;
         } else {
             console.error(`No suitable content found for item: ${nftData.id}`);
             return;
         }
     } else {
         console.error(`No originalMetaUri or suitable content for item: ${nftData.id}`);
         return;
     }
 
     // HTML Elements
     image_url = convertIPFSToHTTP(image_url);
     const name = nftData.meta.name;
     const div = document.createElement('div');
     div.className = 'nft';
 
     const imageWrapper = document.createElement('div');
     imageWrapper.className = 'image-wrapper';
 
     const img = document.createElement('img');
     img.alt = name;
     img.loading = "lazy";
     img.src = "i.gif"; // Placeholder image path
     img.onload = function() {
         img.src = image_url;
         img.classList.add('loaded');
     };
 
     // Append to DOM
     imageWrapper.appendChild(img);
     div.appendChild(imageWrapper);
 
     const h2 = document.createElement('h2');
     h2.textContent = name;
     div.appendChild(h2);
 
     const tokenId = nftData.id.split(':')[2];
     div.addEventListener('click', function() {
         window.location.href = `./single.html?contract_address=${CONTRACT_ADDRESS}&token_id=${tokenId}&image_url=${encodeURIComponent(image_url)}`;
     });
 
     document.getElementById('nft-grid').appendChild(div);
 }
 
 // Display all NFTs on the page
 async function displayAllNFTs(limit) {
     const allNFTs = await fetchAllItemsInCollection(limit);
     if (allNFTs && Array.isArray(allNFTs.items)) {
         await Promise.all(allNFTs.items.map(nftData => displayNFT(nftData)));
     }
 }
 
 async function fetchConfigurations() {
     try {
         // Fetch API configurations
         const apiResponse = await fetch('./api.json');
         if (!apiResponse.ok) {
             throw new Error(`Failed to fetch API configuration. Status: ${apiResponse.status}`);
         }
         const apiData = await apiResponse.json();
         RARIBLE_API_KEY = apiData.raribleApiKey;
 
         // Fetch contract configurations
         const contractResponse = await fetch('./contract.json');
         if (!contractResponse.ok) {
             throw new Error(`Failed to fetch contract configuration. Status: ${contractResponse.status}`);
         }
         const contractData = await contractResponse.json();
         CONTRACT_ADDRESS = contractData.contractAddress;
 
         // Update headers
         headers['Authorization'] = `Bearer ${RARIBLE_API_KEY}`;
         headers['X-API-KEY'] = RARIBLE_API_KEY;
 
         // Wait for the animation to complete
         await animateTitle();
 
         // Add some delay to let the title settle down
         await new Promise(resolve => setTimeout(resolve, 500)); // 1/2 seconds
 
         // Then display the NFTs
         await displayAllNFTs(10); // Start with 10 items for quicker load
 
     } catch (error) {
         console.error("Error fetching configurations:", error);
     }
 }
 
 
 
 
 // Initialize
 fetchConfigurations();
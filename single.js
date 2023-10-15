let RARIBLE_API_KEY;

async function fetchNFTMetadata(asset_contract_address, token_id) {
  const itemId = `ETHEREUM:${asset_contract_address}:${token_id}`;
  try {
    const response = await fetch(`https://api.rarible.org/v0.1/items/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${RARIBLE_API_KEY}`,
        'Accept': 'application/json',
        'X-API-KEY': RARIBLE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for item: ${itemId}`, error);
    return null;
  }
}

async function typingEffect(element, text, delay, fadeOut = false) {
  for (let i = 0; i < text.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    element.textContent += text[i];
  }

  if (fadeOut) {
    element.style.transition = "opacity 5s";
    element.style.opacity = 0;
    setTimeout(() => element.style.display = 'none', 30000);
  }
}

async function displayNFT(asset_contract_address, token_id, imageURL) {
    const nftData = await fetchNFTMetadata(asset_contract_address, token_id);

    if (!nftData) {
        console.error(`Failed to fetch data for token_id: ${token_id}`);
        return;
    }

    const { meta: { name = '', description = '', attributes = [] } = {} } = nftData;

    const openseaLink = `https://opensea.io/assets/${asset_contract_address}/${token_id}`;
    const raribleLink = `https://rarible.com/token/${asset_contract_address}:${token_id}`;
    const manifoldLink = `https://gallery.manifold.xyz/${asset_contract_address}/${token_id}`;

    const elements = {
        img: document.getElementById('nft-img'),
        title: document.getElementById('nft-title'),
        description: document.getElementById('nft-description'),
        opensea: document.getElementById('opensea-link'),
        rarible: document.getElementById('rarible-link'),
        manifold: document.getElementById('manifold-link'),
        traits: document.getElementById('nft-traits')
    };

    elements.img.src = imageURL;
    elements.img.alt = name;
    document.getElementById('nft-img-link').href = imageURL;
    elements.title.textContent = '';
    elements.title.classList.add('glitch');
    elements.title.setAttribute("data-text", name);
    elements.description.textContent = '';
    elements.opensea.href = openseaLink;
    elements.rarible.href = raribleLink;
    elements.manifold.href = manifoldLink;

    // Display traits (attributes)
    attributes.forEach(attr => {
        const traitDiv = document.createElement('div');
        traitDiv.className = 'trait-box';

        const traitKeyDiv = document.createElement('div');
        traitKeyDiv.className = 'trait-key';
        traitKeyDiv.textContent = attr.key;
        traitDiv.appendChild(traitKeyDiv);

        const traitValueDiv = document.createElement('div');
        traitValueDiv.className = 'trait-value';
        traitValueDiv.textContent = attr.value;
        traitDiv.appendChild(traitValueDiv);

        elements.traits.appendChild(traitDiv);
    });

    await typingEffect(elements.title, name, 200, false);    await typingEffect(elements.description, description, 30);
}

async function initialize() {
  try {
    const apiResponse = await fetch('./api.json');
    const apiData = await apiResponse.json();
    RARIBLE_API_KEY = apiData.raribleApiKey;

    const urlParams = new URLSearchParams(window.location.search);
    const tokenId = urlParams.get('token_id');
    const imageURL = urlParams.get('image_url');
    const contractAddress = urlParams.get('contract_address');

    displayNFT(contractAddress, tokenId, imageURL);
  } catch (error) {
    console.error("Error fetching configurations:", error);
  }
}

window.onload = initialize;

let chars = "⟠Ξ0OCTOCORE";
const matrix = document.getElementById('matrix');
const columns = window.innerWidth / 55;

function generateSpan(index) {
    let span = document.createElement("span");
    span.textContent = chars[Math.floor(Math.random() * chars.length)];

    if (index % 20 === 0) {
        span.textContent = 'OCTOCORE'[Math.floor(Math.random() * 8)];
        span.classList.add('octocore-glow');
    }

    span.style.animationDelay = `${Math.random() * 2}s`;
    span.style.fontSize = `${Math.random() * 16 + 14}px`;
    span.style.animationDuration = `${Math.random() * 5 + 2}s`;
    return span;
}

for(let i = 0; i < columns * 15; i++) {
    matrix.appendChild(generateSpan(i));
}

document.documentElement.style.setProperty('--num-columns', columns);

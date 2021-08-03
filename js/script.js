const apiHost = 'https://good-view-database.ronnyjohnti.repl.co'

function renderProduct({ title, image, price, description }) {
  $('#aside-image').append($(`
    <img src="${image}" alt="${title}">
  `))

  $('#details').prepend($(`
    <h1>${title}</h1>
  `))

  $('#details>form').prepend($(`
    <input type="hidden" value="${price}" id="unit_price" />
  `))

  $('#details>form>output').append('R$ '+price+',00')

  $('#description').append($(`
    <p>${description}</p>
  `))
}

function renderProducts(data) {
  const productsContainer = $('#products-container')
  productsContainer.children().last().remove()


  if(data.length > 0) {
    data.map(product => {
      let url = product.title

      console.log(product.title.replace(/[\u0100-\uFFFF]/g, ''))

      let productNode = $(`
        <a href="/produtos.html?${url}=${product.id}" class="product">
          <img src="${product.image}">
          <span>${product.title}</span>
          <button>R\$ ${product.price}</button>
        </a>
      `)

      productsContainer.append(productNode)
    })
  } else {
    let productNode = $(`
      <div class="product">
        <button>Não há produtos para mostrar</button>
      </div>
    `)

    productsContainer.append(productNode)
  }
}

function renderAllProductsPerCategory(data) {
  const productsLists = $('#products-lists')

  data.map(category => {
    productsLists.append($(`<section id="${category.category}"><h1>Categoria: ${category.category}</h1></section>`))
    const sectionCategory = $(`#${category.category}`)

    category.products.map(product => {
      sectionCategory.append($(`
        <div product-id="${product.id}">
          <d onclick="deleteProduct(${product.id})">X</d>
          <h1>${product.title}</h1>
          <img src="${product.image}"/>
          <p>${product.description}</p>
          <button>R\$ ${product.price},00</button>
          ${product.spotlight
          ?
          `<span class="spotlight" onclick="togleSpotlight(${product.id})">Destaque</span>`
          :
          `<span onclick="togleSpotlight(${product.id})">Destaque</span>` }
        </div>
      `))
    })
  })
}

function getProduct() {
  const url = window.location.href.split('=')
  const id = parseInt(url[url.length-1])

  axios.get(apiHost+'/products/'+id)
    .then(response => {
      renderProduct(response.data)
      $('#spinner')[0].classList.toggle('no-display')
      $('main')[0].classList.toggle('no-display')
    })
    .catch(error => {
      alert('Ocorreu um erro. Atualize a página!\n'+error)
    })
}

function getCategories() {
  axios.get(apiHost+'/category')
    .then(response => {
      const categorySelect = $('#category')
      const categories = response.data

      categories.map(category => {
        categorySelect.append($(`<option value=${category.id}>${category.category}</option>`))
      })
    })
}

function getSpotlightProducts() {
  axios.get(apiHost+'/products?spotlight=true')
    .then(response => {
      renderProducts(response.data)
    })
    .catch(error => {
      alert("Ocorreu um erro.\nRecarregue a página novamente!\n"+error)
    })
  ;
}

function getProductsPerCategory(category) {
  axios.get(apiHost+`/category?category=${category}&_embed=products`)
    .then(response => {
      renderProducts(response.data[0].products)
    })
    .catch(error => {
      alert("Ocorreu um erro.\nRecarregue a página novamente!\n"+error)
    })
}

function getAllProductsPerCategory() {
  axios.get(apiHost+`/category?_embed=products`)
    .then(response => {
      renderAllProductsPerCategory(response.data);
    })
    .catch(error => {
      alert("Ocorreu um erro.\nRecarregue a página novamente!\n"+error)
    })
}

function addProduct() {
  const titleProduct = $('#title').val()
  const categoryProduct = $('#category').val()
  const imageProduct = $('#image').val()
  const priceProduct = $('#price').val()
  const descriptionProduct = $('#description').val()
  const spotlightProduct = $('input[name="spotlight"]:checked').val()

  let data = {
    categoryId: parseInt(categoryProduct),
    title: titleProduct,
    image: imageProduct,
    description: descriptionProduct,
    price: parseInt(priceProduct),
    spotlight: spotlightProduct == 'true' ? true : false
  }

  console.log(data)

  let jsonData = JSON.stringify(data)

  axios.post(apiHost+'/products', jsonData,{
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Funções de modificação
async function togleSpotlight(productId) {
  const productDiv = $(`[product-id=${productId}]`)
  let data = {
    spotlight: true
  }

  if(productDiv.children().last()[0].classList.contains('spotlight')) data.spotlight = false
  else data.spotlight = true

  JSON.stringify(data)
  
  await axios.patch(apiHost+'/products/'+productId, data,{
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log(response.data)
      productDiv.children().last()[0].classList.toggle('spotlight')
    })
    .catch(error => console.log(error))
}

async function deleteProduct(productId) {
  const productDiv = $(`[product-id=${productId}]`)
  const checkConfirmation = confirm('Você tem certeza que quer deletar o produto '+productDiv.children()[1].innerText+'?')

  if(checkConfirmation) {
    await axios.delete(apiHost+'/products/'+productId)
      .then(response => {
        console.log(response.data)
        alert('Produto deletado.')
      })
      .catch(e => {
        console.error(e)
        alert('Não foi possível deletar. Tente novamente!')
      })
  }
}
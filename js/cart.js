// 創建購物車清單
function createCartList(){
    let cartList = document.querySelector('.cart-list');

    stylishStorage.cart.list.forEach( (el, index, array) => {
        let listRow = document.createElement('div');
        listRow.classList.add('row');
    
        let variant = document.createElement('div');
        variant.classList.add('variant');       
        

        // img
        let imgDiv = document.createElement('div');
        let img = document.createElement('img');
        imgDiv.classList.add('picture');
        img.setAttribute('src', el.main_image);
        imgDiv.appendChild(img);

        // details
        let details = document.createElement('div');
        details.classList.add('details');
        details.innerHTML = el.name + '</br>';
        details.innerHTML += el.id + '</br>' + '</br>';
        details.innerHTML += '顏色：' + el.color.name + '</br>';
        details.innerHTML += '尺寸：' + el.size ;
        
        variant.appendChild(imgDiv);
        variant.appendChild(details);

        // qty
        let qty = document.createElement('div');
        qty.classList.add('qty');

        let select = document.createElement('select');
        for(let i = 1; i <= el.stock; i++){
            let option = document.createElement('option');
            option.setAttribute('value', i);
            option.textContent = i ;
            // 預設使用者選的數量
            if (option.value === el.qty){
                option.selected = true;
            }
            select.appendChild(option);
        }
        //change subtotal when select qty change
        select.addEventListener('change', () => {
            subtotal.textContent = `NT. ${el.price * event.target.value}`;
            el.qty = event.target.value;
            localStorage.setItem('cart', JSON.stringify(stylishStorage.cart));
            cartListSum();
            totalAddFreight();
        })

        qty.appendChild(select);


        // price
        let price = document.createElement('div');
        price.classList.add('price');
        price.textContent = `NT. ${el.price}`; 

        // subtotal
        let subtotal = document.createElement('div');
        subtotal.classList.add('subtotal');
        subtotal.textContent = `NT. ${el.price * el.qty}`;
         
        
        
        // remove
        let remove = document.createElement('div');
        remove.classList.add('remove');

        let removeImg = document.createElement('img');
        removeImg.setAttribute('src', './style/images/cart-remove.png');
        remove.appendChild(removeImg);


        // append to listRow
        listRow.appendChild(variant);
        listRow.appendChild(qty);
        listRow.appendChild(price);
        listRow.appendChild(subtotal);
        listRow.appendChild(remove);
        cartList.appendChild(listRow);

        // remove function
        remove.addEventListener('click', removeCartItem);

    });

}

// 購物車加總
function cartListSum(){
    cartTotalPrice = 0;
    let subtotals = document.querySelectorAll('.subtotal');
    for(let i=1; i < subtotals.length; i++){
        cartTotalPrice += Number(subtotals[i].textContent.slice(4)); 
    }

    let cartTotal = document.querySelector('#subtotal');
    cartTotal.textContent = cartTotalPrice;
}

//加運費 
function totalAddFreight(){
    let freight = document.querySelector('#freight');
    let total = document.querySelector('#total');
    total.textContent = cartTotalPrice + Number(freight.textContent);
}


// 刪除購物車列
function removeCartItem(){
    let removeItem = event.target.parentNode.parentNode;
    
    // 取得移除列的 index
    let removeIndex = Array.from(removeItem.parentNode.children).indexOf(removeItem);
    
    removeItem.parentNode.removeChild(removeItem);
    
    cartListSum();
    totalAddFreight();

    // 更新 stylishStorage 和 localStorage
    stylishStorage.cart.list.splice(removeIndex, 1);
    localStorage.setItem('cart', JSON.stringify(stylishStorage.cart));
    showCartNum();
    alert('此商品已從購物車移除');

    isCartListEmpty();
}

function showEmptyCart(){
    let cartList = document.querySelector('.cart-list');
    let emptyText = document.createElement('h3');
    emptyText.textContent = '購物車內目前沒有商品';
    cartList.appendChild(emptyText);
}

function isCartListEmpty(){
    if(stylishStorage.cart.list.length === 0){
        showEmptyCart();
        checkoutBtn.setAttribute('disabled', true);
    }
    else{
        checkoutBtn.removeAttribute('disabled');
    }
}


// ------checkout part -------- 


// btn 確認付款 加入事件
checkoutBtn.addEventListener('click', () => {
        if(localStorage.memberInfo){
            checkCustomInput()
        .then(onSubmit)
        .then(setOrder)
        .then(postCheckoutApi)
        .then(removeAllCartList)
        }else{
            alert('請登入會員');
        }
    
});
// -----------------------------


function getRadioValue(radioName){  
    let timeRadio = document.getElementsByName(radioName);
    for(let i=0; i < timeRadio.length; i++){
        if (timeRadio[i].checked){
            return timeRadio[i].value
        }
    }            
    return "undefined";        
}  


function checkCustomInput() {
    return new Promise((resolve, reject) => {
        if(!customNameInput.value){
            alert('請輸入收件人姓名');   
        }else if (!customEmailInput.value){
            alert('請輸入Email');
        }else if (!customPhoneInput.value){
            alert('請輸入連絡電話');
        }else if (!customAddressInput.value){
            alert('請輸入收件地址');
        }else{
            resolve(event);
        }

        return; 
    })
}





// 確認付款
function setOrder(){
    orderInfo = {
        prime:　stylishStorage.prime,
        order: {
            shipping: stylishStorage.cart.shipping,
            payment: stylishStorage.cart.payment,
            subtotal: cartTotalPrice,
            freight: stylishStorage.cart.freight,
            total: Number(cartTotalPrice) + Number(stylishStorage.cart.freight),
            recipient: {
                name: customNameInput.value,
                phone: customPhoneInput.value,
                email: customEmailInput.value,
                address: customAddressInput.value,
                time: getRadioValue('recipient-time')
            },

            list: stylishStorage.cart.list
        }
    }
    return orderInfo;
}


// post to Api
function postCheckoutApi(data){
    let url = 'https://api.appworks-school.tw/api/1.0/order/checkout';
    let loading = document.querySelector('#loading');
    loading.style.display = "block";

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), 
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.memberInfo).access_token}`
        })
      }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(response => {
        orderNum = response.data.number;
        console.log('Success:', response);
        loading.style.display = "none";
        turnToThankyouPage();
      })
      
}

// clear all
function removeAllCartList() {
    let cartList = document.querySelector('.cart-list');
    while (cartList.firstChild) {
        cartList.removeChild(cartList.firstChild);
     }
    
    cartListSum();
    totalAddFreight();

    // 更新 stylishStorage 和 localStorage
    stylishStorage.cart.list = []
    localStorage.setItem('cart', JSON.stringify(stylishStorage.cart));
    showCartNum();

    isCartListEmpty();
}

function turnToThankyouPage(){
    window.location.href =`./thankyou.html?number=${orderNum}`;    
}




// 初始頁面
window.addEventListener('DOMContentLoaded',()=>{
    isCartListEmpty();
    createCartList();
    cartListSum();
    totalAddFreight();
})

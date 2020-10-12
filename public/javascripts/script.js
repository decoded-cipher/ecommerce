
function addToCart(prodId) {
    $.ajax({
        url: '/add-to-cart/' + prodId,
        method: 'get',
        success: function (response) {
            if (response.status) {
                var count = $('#cart-count').html()
                count = parseInt(count) + 1
                $("#cart-count").html(count)
            }
        }
            
    })
}
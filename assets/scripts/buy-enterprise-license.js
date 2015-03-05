var $ = require("jquery")

module.exports = function () {

  if (typeof StripeCheckout === 'undefined') {
    console.log("No stripe")
    return
  }

  $(function () {

    console.log("ready to enterprise license")

    var amount
    var subType

    var handler = StripeCheckout.configure({
      key: $('input[type=hidden]').data('key'),
      image: '/static/images/n-64.png',
      email: $('#billing-email').val(),
      token: function(token, args) {
        token.amount = amount
        token.subType = subType
        token.customerId = $('#customer-id').val()
        token.crumb = $('input[name="crumb"]').val()

        $.ajax({
          url: '/enterprise/license',
          beforeSend: function(xhr) {
            xhr.setRequestHeader('X-CSRF-Token', $('input[name="crumb"]').val())
          },
          data: token,
          type: 'POST',
          headers: {'x-csrf-token': $('input[name="crumb"]').val()}
        })
        .done(function (resp) {
          document.location = '/enterprise/license-paid'
        })
        .error(function (resp) {
          document.location = '/enterprise/license-error'
        })
      }
    })

    $('#buy-starter-pack').click(function (e) {
      subType = $("input[name='starter-pack-plan']:checked").val()
      var description
      switch(subType) {
        case 1:
          description = "Starter Pack, billed monthly"
          amount = 2500
          break
        case 2:
          description = "One-year license for Starter Pack"
          amount = 25000
          break
      }

      handler.open({
        name: 'npm, Inc.',
        description: description,
        amount: amount
      })
      e.preventDefault()
    })

    /*
    $('#buy-multi-seat').click(function (e) {
      subType = 3
      var seatString = $('#multi-seat-count').val()
      if (!seatString) {
        alert("You must enter a number of seats")
        e.preventDefault()
        return false
      }
      var seats = parseInt(seatString)
      amount = 2000 * seats;

      handler.open({
        name: 'npm, Inc.',
        description: "Buy " + seats + " seat license, billed monthly",
        amount: amount
      });
      e.preventDefault()
    });
    */


  })
}

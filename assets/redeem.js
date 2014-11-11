/**
*** author: @acutler
*** 211 Enterprises
*** June 2013
**/

$(document).ready(function() {
  $("#contact-form.redeem input[type='submit']").click(function() {
    // Support CORS
  	$.support.cors = true;
    
  	if(redeem.validation() == 0) {
	  	//Submit form and show successful thank you message.
	    var formData = $('form').serialize();
	    //Check if opted in on mailing list and save.
	    redeem.mailingList(formData);
	    //Save voucher redemption
	    redeem.saveRedemption(formData);
    }
    
    return false;
  });
  
  redeem.showAdditionalVouchers('select#quantity');
});

/* voucher redemption namespace */
var redeem = {

  validation : function() {
    var count = 0,
    		product = 0,
    		errorContainer = $('.error-msg.redeem-js'),
        errorList = $("ul.error-list.redeem");
    var requiredFields = {
      "first_name" : "Please provide your first name.",
      "last_name" : "Please provide your last name.",
      "email" : "Please provide a valid email address.",
      "site_purchased" : "Please provide the website you purchased from.",
      "quantity" : "Please provide your order quantity.",
      "voucher_number_1" : "Please enter at least one voucher number.",
      "teeth_kit" : "Please choose at least one product",
      "rx_pen" : "Please choose at least one product",
      "address" : "Please provide your address.",
      "city" : "Please provide your city.",
      "state" : "Please provide your state.",
      "zip_code" : "Please provide your zip code.",
      "country" : "Please provide your country."
    };
    
    var fields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "site_purchased",
      "quantity",
      "voucher_number_1",
      "voucher_number_2",
      "voucher_number_3",
      "voucher_number_4",
      "voucher_number_5",
      "voucher_number_6",
      "teeth_kit",
      "rx_pen",
      "address",
      "city",
      "state",
      "zip_code",
      "country",
      "comments"
    ];
    
    errorList.empty();
    
    $.each(requiredFields, function(key, value) {
    	var elem = $("#" + key),
    			elemType = elem.attr('type');

      if(elem.val() == "") {
      	count++;
        $("#" + key).parent().addClass('has-error');
        errorList.append("<li>" + value + "</li>");
      } else {
        $("#" + key).parent().removeClass('has-error'); 
      }
    });
    
    if(count == 0) {
      errorList.slideUp();
    } else {
    	$('html, body').animate({ scrollTop: 260 }, 300);
    	errorContainer.slideDown();
      errorList.slideDown();
    }
    
    return count;
  },
  
  showAdditionalVouchers : function(trigger) {
    var vouchers = $('.voucherNum');
    
    $(trigger).change(function() {
      var value = $(this).val();

      vouchers.addClass('hidden');
      //Loop through hidden voucher fields
      for(i = 2; i <= value; i++) {
        $("input#voucher_number_" + i).parent().removeClass('hidden');
      }
	});
  },
  
  saveToMailing : function(formData) {
    $.ajax({
    	dataType: 'json',
      crossDomain: true,
    	cache: false,
      type: 'POST',
      url: 'http://smile-sciences-cdn-prod.herokuapp.com/api/mailinglist/' + formData,
      success: function(data) {}
    });
  },
  
  mailingList : function(formData) {
    if($("input[name='mailingList']").is(":checked")) {
      redeem.saveToMailing(formData);  
    }
  },
  
  saveRedemption : function(formData) {
    var loading = $("div.loading");
    
    //Show redeeming loader
    loading.show();
    //Send ajax call to save voucher(s)
    $.ajax({
      type: 'POST',
      dataType: 'json',
      crossDomain: true,
      cache: false,
      url: 'http://smile-sciences-cdn-prod.herokuapp.com/api/redeem/' + encodeURIComponent(formData),
      success: function(data) {
      	if(data.response == "success") {
					$('form').submit();
				} else {
          loading.hide();
          $('html, body').animate({ scrollTop: 260 }, 300);
          redeem.submittionMessage(data.response);
        }   
      },
      //Handle ajax error
      error: function(jqXHR, textStatus, errorThrown) {
        $('html, body').animate({ scrollTop: 260 }, 300);
        redeem.submittionMessage(errorThrown)
      },
      //Completion of the ajax call
      complete: function() {
        loading.hide();    
      }
    });
  },
  
  submittionMessage : function(error) {
    var errorList = $("ul.error-list.redeem");
    
    errorList.empty;
    errorList.append(error);
    errorContainer.slideDown();
    errorList.slideDown();
  }
};


jQuery.fn.serializeObject = function(options) {

    options = jQuery.extend({}, options);

    var self = this,
        json = {},
        push_counters = {},
        patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push":     /^$/,
            "fixed":    /^\d+$/,
            "named":    /^[a-zA-Z0-9_]+$/
        };


    this.build = function(base, key, value){
        base[key] = value;
        return base;
    };

    this.push_counter = function(key){
        if(push_counters[key] === undefined){
            push_counters[key] = 0;
        }
        return push_counters[key]++;
    };

    jQuery.each(jQuery(this).serializeArray(), function(){

        // skip invalid keys
        if(!patterns.validate.test(this.name)){
            return;
        }

        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;

        while((k = keys.pop()) !== undefined){

            // adjust reverse_key
            reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

            // push
            if(k.match(patterns.push)){
                merge = self.build([], self.push_counter(reverse_key), merge);
            }

            // fixed
            else if(k.match(patterns.fixed)){
                merge = self.build([], k, merge);
            }

            // named
            else if(k.match(patterns.named)){
                merge = self.build({}, k, merge);
            }
        }

        json = jQuery.extend(true, json, merge);
    });

    return json;
}
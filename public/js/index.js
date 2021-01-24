$(document).ready(function() {
    $("#lightSlider-recommendation").lightSlider(
    //     {
    //     item:4,
    //     loop:false,
    //     slideMove:2,
    //     easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
    //     speed:600,
    //     responsive : [
    //         {
    //             breakpoint:800,
    //             settings: {
    //                 item:3,
    //                 slideMove:1,
    //                 slideMargin:6,
    //               }
    //         },
    //         {
    //             breakpoint:480,
    //             settings: {
    //                 item:2,
    //                 slideMove:1
    //               }
    //         }
    //     ]
    // }
    ); 
    console.log('hello')
    getRecommendation(recommendationISBN =>{
        // $("#recommendation-list").addClass("hide")
        
        console.log(recommendationISBN)
        for(let i = 0; i <recommendationISBN.length; i++){
            
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            let li = $("<li>");
            li.append(img);
            $("#lightSlider-recommendation").append(li)
        }

        $("#lightSlider-recommendation").removeClass("hide")
    });



});
$(document).ready(function() {

    getRecommendation(recommendationISBN =>{
        $("#recommendation-list").addClass("hide")
        
        for(let i = 0; i < Math.min(recommendationISBN.length); i++){
            
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            $("#recommendation-list").append(img)
        }

        $("#lightSlider-recommendation").removeClass("hide")
    });



});
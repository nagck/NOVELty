$(document).ready(function() {
    

    getRecommendation(recommendationISBN =>{
        
        console.log(recommendationISBN)
        for(let i = 0; i <recommendationISBN.length; i++){
            
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            let li = $("<li>");
            li.append(img);
            $("#lightSlider-recommendation").append(li)
            console.log(li)
        }
        $("#lightSlider-recommendation").lightSlider(
            {
            item:3,
            // autoWidth:true,
            slideMove:1,
            easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
            speed:600,
            enableDrag:false,
            responsive : []
        }); 
        
        $("#recommendation-placeholder").addClass('hide');
        $("#lightSlider-recommendation").removeClass('hide');
    });

    $("#lightSlider-recommendation").click(e =>{
        e.preventDefault();
        e.stopPropagation();
        if(e.target.matches("img")){
            console.log(e.target);
        }
    })


});

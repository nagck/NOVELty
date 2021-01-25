window.globals = {
    current: "",
    past: ""
};

$(document).ready(function() {
    
    fetch("/api/get_user").then(response => response.json())
    .then(function(data) {
      $("#name-of-user").text(data.name);
    })

    let sliderCurrent = $("#lightSlider-current").lightSlider(
        {
        item:3,
        slideMove:1,
        easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        speed:600,
        enableDrag:false,
        responsive : []
    }); 

    let sliderPast = $("#lightSlider-past").lightSlider(
        {
        item:3,
        slideMove:1,
        easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        speed:600,
        enableDrag:false,
        responsive : []
    }); 

    window.globals = {
        current: sliderCurrent,
        past: sliderPast
    };

    // get the recommed book via isbn
    getRecommendation(recommendationISBN =>{
        
        console.log(recommendationISBN)
        for(let i = 0; i <recommendationISBN.length; i++){
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            img.attr("alt",`ISBN: ${recommendationISBN[i]}`);
            let li = $("<li>");
            li.append(img);
            $("#lightSlider-recommendation").append(li)
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

    // when you click on the recommended books it shows a modal
    $("#lightSlider-recommendation").click(e =>{
        e.preventDefault();
        e.stopPropagation();
        if(e.target.matches("img")){
            console.log($(e.target).attr("data-isbn"))
            getBookInfo($(e.target).attr("data-isbn"), data=>{
                console.log($(e.target))
    
                $("#modal-new-book").attr("data-isbn", $(e.target).attr("data-isbn"))
                $("#book-cover").html(`<img src='${getBookCover($(e.target).attr("data-isbn"))}'>`)
                $("#book-title").text(data.title)
                $("#book-author").text(data.author)
                $("#book-page").text(data.pageCount)
                $("#book-description").text(data.description)
                
                $("#book-review").html("");
                data.reviews.forEach(el =>{
                    $("#book-review").append(`<p>Rating: ${el.rating}</p><p>${el.content}</p><p>-${el.User.username}</p>`)
                })
    
                $("#modal-new-book").modal("show")
            })
        }
    })

    // when you click on the add book to list, it will add the book in the readings database
    $("#add-book").click(e =>{
        e.preventDefault();
        let bookObj = {
            isbn: $("#modal-new-book").attr("data-isbn"),
            title: $("#book-title").text(),
            author: $("#book-title").text()
        }

        addBookToList(bookObj,true, (notExists, data)=>{

            if(notExists[1]){

               
                $("#lightSlider-current").append($(`li img[data-isbn='${$("#modal-new-book").attr("data-isbn")}'`))
                globals.current.refresh();
                
            }
            
            $("#modal-new-book").modal("hide")
        })

    });

    // when click on the books in your current list, it will show a modal to rate the book
    $("#lightSlider-current").click(e =>{
        e.preventDefault();
        e.stopPropagation();
        
        if(e.target.matches("img")){
            $("#modal-rating").attr("data-isbn", $(e.target).attr("data-isbn"))
            $("#modal-rating").modal("show")   
        }
    })

    // when you submit the form for the rating    
    $("#rating-form").submit((e)=>{
        e.preventDefault();
        e.stopPropagation();
        let finished = $("input[type='radio'][name='flexRadioDefault']:checked").val();
        let rating = parseInt($("input[type='radio'][name='rating']:checked").val());
        let content = $("textarea").val();

        fetch(`/api/book/${$("#modal-rating").attr("data-isbn")}`)
            .then(response => response.json())
            .then(data => {
                let bookId = data[0].id;
                
                if(finished=== "true") {
                    let favourite = (rating < 3) ? false: true;
                    let updateObj = {
                        favourite : favourite,
                        bookId: bookId
                    }
    
                    fetch(`/api/book/`, {
                        method : "PUT",
                        headers: {
                            "content-type": "application/json",
                            "accept" : "application/json"
                        },
                        body: JSON.stringify(updateObj)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        $("#lightSlider-past").append($(`li img[data-isbn='${$("#modal-rating").attr("data-isbn")}'`));
                        globals.past.refresh();
                        $("#modal-rating").attr("data-isbn", "");
                        $("#finished").prop('checked', true);        
                        $('input[name=rating]').attr('checked',false);                
                        $("textarea").val("");
                        $("#modal-rating").modal("hide") 
                    })
                }
                else{
                    fetch(`/api/book/${bookId}`, {
                        method : "DELETE"
                    })
                    .then(response => response.json())
                    .then(data =>{
                        console.log(data);
                        $(`img[data-isbn='${$("#modal-rating").attr("data-isbn")}'`).remove();
                        $("#modal-rating").attr("data-isbn", "");
                        $("#finished").prop('checked', true);        
                        $('input[name=rating]').attr('checked',false);                
                        $("textarea").val("");
                        $("#modal-rating").modal("hide") 
                    })
                }

                let reviewObj = {
                    content: content,
                    rating: rating
                }
                console.log(reviewObj)
                fetch(`/api/books/review/${bookId}`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "accept" : "application/json"
                    },
                    body: JSON.stringify(reviewObj)
                })
                .then(response => response.json())
                .then(data => console.log(data))
                
            })
    });



    var resultsList = $("#search-results")

    var titleForm = $("form.title");
    var titleInput = $("input#title-input");
    titleForm.on("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();
        let title = titleInput.val().trim();
        console.log(title)
        searchByTitle(title, result =>{
            console.log(result);
            resultsList.empty();
            result.forEach(book =>{
                
                let li = $("<li></li>").text(`${book.title} by ${book.author.toString()}`);
                li.attr("data-isbn", book.isbn);
                li.addClass("list-group-item");
                li.attr("data-title", book.title);
                li.attr("data-author", book.author);
                
                resultsList.append(li);
            })
        });
    });

    var authorForm = $("form.author");
    var authorInput = $("input#author-input");
    authorForm.on("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();
        let author = authorInput.val().trim();
        console.log(author)
        searchByAuthor(author, result =>{
            console.log(result);
            resultsList.empty();
            result.forEach(book =>{
                
                let li = $("<li></li>").text(`${book.title} by ${book.author.toString()}`);
                li.addClass("list-group-item")
                li.attr("data-isbn", book.isbn);
                li.attr("data-title", book.title);
                li.attr("data-author", book.author);
                
                resultsList.append(li);
            })
        });
  });

  $('#exampleModalCenter').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget) // Button that triggered the modal
    let type = button.data('search') // Extract info from data-* attributes
    let modal = $(this)
    modal.find('.modal-title').text('Add a book to your ' + type + ' reading list.') 
    modal.attr('data-search', type)
  })

  resultsList.click((e)=>{
      e.preventDefault();
      if(e.target.matches("li")) {
            let bookObj = JSON.parse(JSON.stringify(e.target.dataset));

            console.log(bookObj); 

            addBookToList(bookObj,false, (notExists, data)=>{
                console.log(notExists)
                console.log(data)
                if(notExists[1]){
                    

                    let img = $("<img>").attr("src",data[0].URL);
                    img.attr("data-isbn",data[0].ISBN);
                    img.attr("atl",data[0].name);
                    let li = $("<li>");
                    li.append(img);
                    if($('#exampleModalCenter').attr("data-search") === "current") {
                        $("#lightSlider-current").append(li);
                        globals.current.refresh();
                    }
                    else{
                        $("#lightSlider-past").append(li);
                        globals.past.refresh();
                    }
                }
                titleInput.val("");
                authorInput.val("")
                resultsList.empty();
                $("#exampleModalCenter").modal('hide');
            })
    }

    })

});

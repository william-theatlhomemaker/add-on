function start(){
  return [homeCard().build()]
}
function click(){
  Logger.log("Clicked COI")
}

function homeCard() {
  let card = CardService.newCardBuilder().setHeader(
                CardService.newCardHeader().setTitle("Home")
              )
  card.addSection(
    buttonSection()
  )
  return card  
}

function buttonSection (){

 return  CardService.newCardSection().addWidget(
          CardService.newButtonSet()
          .addButton(
            receiptCard()
          )
          .addButton(
            coiCard()
          )
        )
}

function receiptCard(){
  return CardService.newTextButton().setText("Receipt").setOnClickAction(
                      CardService.newAction().setFunctionName('receiptCardOnOpen')
                    )
}

function coiCard(){

      return  CardService.newTextButton().setText("COI").setOnClickAction(
                CardService.newAction().setFunctionName("click")
      )
}
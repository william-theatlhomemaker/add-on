/**
 * Returns the contextual add-on data that should be rendered for
 * the current e-mail thread. This function satisfies the requirements of
 * an 'onTriggerFunction' and is specified in the add-on's manifest.
 *
 * @param {Object} event Event containing the message ID and other context.
 * @returns {Card[]}
 */
function receiptCardOnOpen(event) {
  Logger.log("receiptCardOnOpen(event)")
  var message = getCurrentMessage(event);
  //Logger.log(event)
  let prefills = {
                  receivedDate:getReceivedDate(message),
                  cardType:findCardType(message),
                  amounts:findDollarAmounts(message),
                  attachments:getAttachment(message),
                  receiptId:ATL.getUUID(),
                  ref:hasRef(message)
                  }
                  //Logger.log(prefills)
  let card = receiptCard(prefills)
  let t =  testingee()
  return [card.build()]
}


function  testingee(){
  return CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle("Testing"))
}

/**
 * @param {Object}
 * @return {CardBuilder} 
 */
function receiptCard(prefills) {
  Logger.log("receiptCard(prefills) called")
  
  return CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Enter Receipt")
    )
    .addSection(formSection(prefills))
    
}

/**
 * Retrieves the current message given an action event object.
 * @param {Event} event An action event object
 * @return {Message}
 */
function getCurrentMessage(event) {
  var accessToken = event.messageMetadata.accessToken;
  var messageId = event.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  return GmailApp.getMessageById(messageId);
}

/**
 * @param {Object} prefills - information about open email.
 * @return {Cardsection}
 */
function formSection(prefills){
  let section = CardService.newCardSection()
  section.addWidget(
      datePicker(prefills)
    )
  section.addWidget(
      purchaseAccountInput(prefills)
    ) 
  section.addWidget(
      propertyInput()
    )
  section.addWidget(
      vendorInput()
    )
  section.addWidget(
      itemInput()
    )
  section.addWidget(
      amountInput(prefills)
    )
  section.addWidget(
      referanceNumberInput(prefills)
    )
  section.addWidget(
      attachmentRadioButton(prefills)
    )
  section.addWidget(
      buttons()
    )
  return section
}

/**
 * Create a datePicker 
 * @param {Object} prefills - information about open email.
 * @return {DatePicker}
 */
function datePicker(prefills){
  return CardService.newDatePicker()
    .setValueInMsSinceEpoch(
      new Date(prefills.receivedDate).getTime()
    )
    .setFieldName("transactionDate")
    .setTitle("Transaction Date")
}

/**
 * create text input field 
 * @param {Object} prefills - information about open email.
 * @return {TextInput}
 */
function purchaseAccountInput(prefills){
  let purchaseAction = CardService.newAction()
    .setFunctionName('getPurchaseAccounts');
    
  return CardService.newTextInput()
    .setFieldName('purchaseAccount')
    .setTitle('Purchase Account')
    .setValue(prefills.cardType)
    .setSuggestionsAction(purchaseAction)
}

/**
 * create text input field 
 * @param {Object} prefills - information about open email.
 * @return {TextInput}
 */
function propertyInput(){
  //Property
  let propertyAction = CardService.newAction()
      .setFunctionName('getProperties');
    
  return CardService.newTextInput()
    .setFieldName('property')
    .setTitle('Property')
    .setSuggestionsAction(propertyAction);
}

/**
 * create text input field 
 * @param {Object} prefills - information about open email.
 * @return {TextInput}
 */
function vendorInput(){
  //Vendor
  var vendorAction = CardService.newAction()
      .setFunctionName('getVendors')
    
  return CardService.newTextInput()
    .setFieldName('vendor')
    .setTitle('Vendor')
    .setSuggestionsAction(vendorAction)
}

/**
 * create text input field 
 * @param {Object} prefills - information about open email.
 * @return {TextInput}
 */
function itemInput(){
  //item
  let itemAction = CardService.newAction()
      .setFunctionName('getItems');
    
  return CardService.newTextInput()
    .setFieldName('item')
    .setTitle('Item')
    .setSuggestionsAction(itemAction);
}

/**
 * create text input field if prefills.amounts.length is less than 2
 * else a radio button group is built
 * 
 * @param {Object} prefills - information about open email.
 * @return {TextInput} Google Card Service
 * @return {SelectionInput} radioGroup - list of found dollar amounts
 */
function amountInput(prefills){
  if(prefills.amounts.length === 0){
  return CardService.newTextInput()
    .setFieldName('amount')
    .setTitle('Amount')
  }
  if(prefills.amounts.length === 1){
    return CardService.newTextInput()
    .setFieldName('amount')
    .setTitle('Amount')
    .setValue(prefills.amounts[0])
  }else{
    let radioGroup = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle("Found amounts.")
      .setFieldName("amountIndex")

    prefills.amounts.forEach(function(amount,index){
      radioGroup.addItem(amount, index, false)
    })

    return radioGroup
  }
  
}


/**
 * create text input field for referance number
 * 
 * @param {Object} prefills - information about open email.
 * @return {TextInput} Google Card Service
 */
function referanceNumberInput(prefills){
  return CardService.newTextInput()
    .setFieldName('referanceNumber')
    .setTitle('Referance Number')
    .setHint("Can be any unique identifier")
    .setValue(prefills.ref)
}

/**
 * create a radio button group to display email attachments
 * by file name
 * 
 * @param {Object} prefills - information about open email.
 * @return {SelectionInput} radioGroup 
 */
function attachmentRadioButton(prefills){
  Logger.log('attachmentRadioButton(prefills) called')
  Logger.log(prefills)
  var radioGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Select one attachment.")
    .setFieldName("attachments")

  
  if(prefills.attachments.length > 0 ){
    prefills.attachments.forEach(function(attachment,index){
      if(attachment.getContentType() == 'image/jpeg' || attachment.getContentType() == 'application/pdf' || attachment.getContentType() == 'image/jpg') {
      radioGroup.addItem(attachment.getName(), index, true)
      }else{
        radioGroup.addItem("Email as receipt", -1, true)
      
      }
    })
  }else{
    radioGroup.addItem("Email as receipt", -1, true)
  }
    
    return radioGroup
}

/**
 * create buttons
 * 
 * @return {ButtonSet} 
 */
function buttons(){

  var submitForm = CardService.newAction().setFunctionName('submitForm');

  return CardService.newButtonSet()
    .addButton(
      CardService.newTextButton()
        .setText('Submit')
        .setOnClickAction(submitForm)
    );
}

/**
 * Determines date the email was received.
 *
 * @param {Message} message The message that is currently open.
 * @returns {String}
 */
function getReceivedDate(message) {
 
  return message.getDate().toLocaleDateString();
}

/**
 * finds credit card type
 * @param {message} message The message that is currently open.
 * @returns {String} 
 */
function findCardType(message){
  Logger.log("findCardType(message) called")
  
  let messageBody = message.getPlainBody();
 
  var regex = /Credit Card Type:(.*)/g;
  try{
    let match = regex.exec(messageBody)[1].trim()
    switch (match){
      case 'American Express':
        Logger.log('AMEX - Delta Rewards CC - 92002')
        return 'AMEX - Delta Rewards CC - 92002'
      //break
    }
  }catch(e){
    return ''
  }
}

/**
 * Finds dollar amounts in email body.
 *
 * @param {Message} message The message that is currently open.
 * @returns {String}
 */
function findDollarAmounts(message) {

  Logger.log('findDollarAmounts(message) called')
  var messageBody = message.getPlainBody();
  let regex = /((\(\d+\.\d+\)|\d+\.\d+))/g
  let results = []
  let match
  while ((match = regex.exec(messageBody)) !== null) {
    //console.log(`Found ${match[0]}. Next starts at ${regex.lastIndex}.`);
    if(!results.includes(parseInt(match[0]))){
      results.push(parseInt(match[0]))
    }
  }
  let output= []
  results.forEach(function(amount){
    if(!output.includes(amount)){
      output.push(amount)
    }
  })
  return output 
}

/**
 * Retrive message attachments
 * 
 * @param {Message} message The message that is currently open.
 * @returns {Array}
 */
function getAttachment(message){
  Logger.log("Get Attachments called")
  return message.getAttachments()
}

/**
 * trys to finds a unique identifier returns '' if no match if found
 * @param {message} message The message that is currently open.
 * @returns {String} 
 */
function hasRef(message){
  Logger.log("hasRef(message) called")
  let messageBody = message.getPlainBody();
  var regex = /Reference Number:(.*)/g;
  match = regex.exec(messageBody);
    
  while (!match) {
    match = ['1',''];
  }
  return match[1]
}
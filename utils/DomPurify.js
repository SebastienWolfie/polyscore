export function purifyNumber(number){
  number = number.replace(/[^0-9]/g, '');
  return number;
}

export function purifyDecimal(number){
  number = number.replace(/(?!^-)[^0-9.]/g, '');
  number = number.replace(/(\..*)\./g, '$1');
  return number;
}


export function onlyForCurrency($event, price) {
  price = parseInt(price);
  let keyCode = $event.keyCode ? $event.keyCode : $event.which;

  // only allow number and one dot
  if (
    (keyCode < 48 || keyCode > 57) &&
    (keyCode !== 46 || price.indexOf(".") != -1)
  ) {
    // 46 is dot
    $event.preventDefault();
  }

  // restrict to 2 decimal places
  console.log(price)
  if (
    price != null &&
    price.indexOf(".") > -1 &&
    price.split(".")[1].length > 1
  ) {
    $event.preventDefault();
  }
}

export function onlyForNumbers($event) {
  let keyCode = $event.keyCode ? $event.keyCode : $event.which;

  // only allow number and one dot
  if (keyCode < 48 || keyCode > 57) {
    $event.preventDefault();
  }
}

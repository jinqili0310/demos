// qmenu_charge_refund.js

// Write a function that takes in (1) an order object and (2) a new transaction amount, and returns a modified order object. The new transaction amount will be negative or positive depending on whether it is a refund or charge, respectively.
// An order object contains an array of charges and an array of refunds. Each charge object has a id and an amount. Each refund object has a charge_id (the id of the charge that that refund is fully or partially refunding) and an amount (the size of the refund). Charges can only be "reversed" by getting fully refunded. Refunds cannot be reversed.
// Each order has an initial charge, and potentially zero or more additional charges and/or refunds.

// Minimize what: For each charge, there is a flat processing fee of $0.30, so we want to minimize how many times we incur this fee.
// Constraints: Unfortunately, we can't just reverse an old charge and process a new charge equivalent to the new total. (e.g. original charge of $25, customer adds a $2 tip to their order, we can't reverse the $25 charge and process a new $27 charge, because this affects the customer's credit line).
// [Optional] Additional consideration: Since the minimum possible fee for a transaction is $0.30, we will still incur this fee unless the transaction is fully refunded, which means that if we refunded $0.80 of a $1 transaction, we would actually be worse off than if we had just refunded the full $1 (-$0.80-$0.30=-$1.10). And what should we do if there are more future refunds?

let chargeRefund = function(transaction, order) {
	if (transaction === 0) {
		return order;
	} else if (transaction > 0) {
		// when the amount of transaction is positive,
		// charge transaction from the first charge object
		order.charges[0]['amount'] += transaction;

		// push refunded object to refunds:[]
		order.refunds.push({
			charge_id: order.charges[0]['id'],
			amount: transaction
		});

		return order;
	} else if (transaction < 0) {
		// when the amount of transaction is negative,
		// refund transaction to multiple charges in ascending order,
		// until transaction === 0

		// when refunds:[] is not empty
		if (order.refunds.length) {
			// iteration to find the ids of the objects that has been refunded
			for (let chargeObj in order.charges) {
				let chargeObject = order.charges[chargeObj]; // all objects
				chargeObject['remain_refundability'] = chargeObject['amount'];
				for (let refundObj in order.refunds) {
					let refundObject = order.refunds[refundObj]; // objects that have been refunded

					if (refundObject['charge_id'] === chargeObject['id']) {
						// add remain_refundability to refundObj
						let remainRefund = chargeObject['amount'] + refundObject['amount'];
						chargeObject['remain_refundability'] = remainRefund;
					}
				}
			}

			// sort charges:[] in ascending order of the remain_refundability
			let sortedCharges = order.charges;
			sortedCharges.sort((a, b) => (a['remain_refundability'] > b['remain_refundability'] ? 1 : -1));

			// refund the transaction from sorted charge objects until transaction === 0
			for (let sortedObj in sortedCharges) {
				if (transaction < 0) {
					const sortId = sortedCharges[sortedObj]['id'];

					// the amount that need to be refunded from each object
					const toRefund = sortedCharges[sortedObj]['remain_refundability'];
					const toTransact = toRefund > Math.abs(transaction) ? transaction : toRefund * -1;

					// find if there is any object needs to be refunded again
					let refundAgain = order.refunds.filter((obj) => {
						return obj['charge_id'] === sortId && toTransact;
					})[0];
					if (refundAgain) refundAgain['amount'] += toTransact;

					// reduce amount of transaction
					transaction -= toTransact;

					// prepare new charge object to push into charges:[]
					let newObj = {};
					newObj['charge_id'] = sortId;
					newObj['amount'] = toTransact;

					// define if the charge object has been charged before
					const find = order.refunds.some((ele) => ele['charge_id'] === sortId);
					if (!find) order.refunds.push(newObj);
				}
			}

			// when there is still transaction needs to be refunded
			if (transaction < 0) {
				// define and push new refund object to refunds:[]
				const refundsLen = order.refunds.length;
				let refundObjTemp = order.refunds[refundsLen - 1]['charge_id'];
				const idLen = refundObjTemp.length;
				let idPre = refundObjTemp.substring(0, idLen - 1);
				let idNum = refundsLen + 1;

				let extraObj = {};
				extraObj['charge_id'] = idPre.concat(idNum.toString());
				extraObj['amount'] = transaction;
				order.refunds.push(extraObj);
			}
		}
		// delete 'remain_refundability' property
		order.charges.forEach((obj) => delete obj['remain_refundability']);

		return order;
	}
};

// Sample input

// Test Case 1
// New transaction: -6.80
let order1 = {
	charges: [
		{ id: '5cdd802nasd10001', amount: 20 },
		{ id: '5cdd802nasd10002', amount: 1 },
		{ id: '5cdd802nasd10003', amount: 1 },
		{ id: '5cdd802nasd10004', amount: 2 },
		{ id: '5cdd802nasd10005', amount: 3 },
		{ id: '5cdd802nasd10006', amount: 1 }
	],
	refunds: [ { charge_id: '5cdd802nasd10006', amount: -1 } ]
};
// chargeRefund(-6.8, order1)
console.log(chargeRefund(-6.8, order1));

/*
for (let obj in order1.charges) {
    console.log(order1.charges[obj]["amount"]);
    // obj === {id: "", amount: Number};
}
*/

// order1 = {
// 	charges: [
// 		{ id: '5cdd802nasd10001', amount: 20 },
// 		{ id: '5cdd802nasd10002', amount: 1 },
// 		{ id: '5cdd802nasd10003', amount: 1 },
// 		{ id: '5cdd802nasd10004', amount: 2 },
// 		{ id: '5cdd802nasd10005', amount: 3 },
// 		{ id: '5cdd802nasd10006', amount: 1 }
// 	],
// 	refunds: [
// 		{ charge_id: '5cdd802nasd10006', amount: -1 },
// 		{ charge_id: '5cdd802nasd10002', amount: -1 },
// 		{ charge_id: '5cdd802nasd10003', amount: -1 },
// 		{ charge_id: '5cdd802nasd10004', amount: -2 },
// 		{ charge_id: '5cdd802nasd10005', amount: -2.8 }
// 	]
// };

// Test Case 2
// New transaction: 4
let order2 = {
	charges: [
		{ id: '5cdd802nasd10001', amount: 20 },
		{ id: '5cdd802nasd10002', amount: 1 },
		{ id: '5cdd802nasd10003', amount: 1 },
		{ id: '5cdd802nasd10004', amount: 2 },
		{ id: '5cdd802nasd10005', amount: 3 },
		{ id: '5cdd802nasd10006', amount: 1 }
	],
	refunds: [ { charge_id: '5cdd802nasd10006', amount: -1 } ]
};
console.log(chargeRefund(4, order2));

// Test Case 3
// New transaction: 0
let order3 = {
	charges: [
		{ id: '5cdd802nasd10001', amount: 20 },
		{ id: '5cdd802nasd10002', amount: 1 },
		{ id: '5cdd802nasd10003', amount: 1 },
		{ id: '5cdd802nasd10004', amount: 2 },
		{ id: '5cdd802nasd10005', amount: 3 },
		{ id: '5cdd802nasd10006', amount: 1 }
	],
	refunds: [ { charge_id: '5cdd802nasd10006', amount: -1 } ]
};
console.log(chargeRefund(0, order3));

// Test Case 4
// New transaction: -57
let order4 = {
	charges: [
		{ id: '5cdd802nasd10001', amount: 20 },
		{ id: '5cdd802nasd10002', amount: 1 },
		{ id: '5cdd802nasd10003', amount: 1 },
		{ id: '5cdd802nasd10004', amount: 2 },
		{ id: '5cdd802nasd10005', amount: 3 },
		{ id: '5cdd802nasd10006', amount: 1 }
	],
	refunds: [ { charge_id: '5cdd802nasd10006', amount: -1 } ]
};
console.log(chargeRefund(-57, order4));

// Test Case 5
// New transaction: -6
let order5 = {
	charges: [
		{ id: '5cdd802nasd10001', amount: 20 },
		{ id: '5cdd802nasd10002', amount: 1 },
		{ id: '5cdd802nasd10003', amount: 2 },
		{ id: '5cdd802nasd10004', amount: 3 }
	],
	refunds: [ { charge_id: '5cdd802nasd10002', amount: -1 }, { charge_id: '5cdd802nasd10003', amount: -1.5 } ]
};
console.log(chargeRefund(-6, order5));

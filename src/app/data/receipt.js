// Sample receipt data
export const receipts = [
	{
		id: "1",
		date: "2025-11-06",
		store: "Sample Store",
		items: [
			{ name: "Product A", qty: 2, price: 50000 },
			{ name: "Product B", qty: 1, price: 75000 },
		],
		total: 175000,
		status: "Completed",
		payment: "Credit Card",
	},
	{
		id: "2",
		date: "2025-11-05",
		store: "Another Store",
		items: [
			{ name: "Product C", qty: 1, price: 120000 },
		],
		total: 120000,
		status: "Pending",
		payment: "Bank Transfer",
	},
];

export function getReceiptById(id) {
	return receipts.find(r => r.id === id);
}

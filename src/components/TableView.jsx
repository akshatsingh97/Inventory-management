import React from 'react';
import { useState, useEffect } from 'react';
import Widget from './Widget';
import './TableView.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TableView = ({ isAdmin }) => {
    const [data, setData] = useState([]);
    const [disabledRows, setDisabledRows] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [widgetData, setWidgetData] = useState([]);
    

    useEffect(() => {
        fetchData();
    },[]);

    useEffect(() => {
        updateWidgets(data, disabledRows);
    },[data, disabledRows]);

    function sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // This code is specially added to avoid the empty returns from the API.
    const checkResponse = async (response, retryCount) => {
        const maxRetries = 5;
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || 1;
            console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds.  Retry attempt: ${retryCount + 1}`);

            if (retryCount >= maxRetries) {
                throw new Error("Exceeded maximum retry attempts due to rate limits.");
            }    

            await sleep(retryAfter * 1000);
            return fetchData(retryCount + 1);
        }
    }
    
    const fetchData = async (retryCount = 0) => {
        const apiURL = "https://dev-0tf0hinghgjl39z.api.raw-labs.com/inventory";
        try{
            await sleep(1000);
            const response = await fetch(apiURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            await checkResponse(response, retryCount);
            
            const contentType = response.headers.get('Content-Type');
            if(contentType && contentType.includes('application/json')){
                const values = await response.json();
                setData(values);
            }
            else{
                console.warn('No content in response');
                setData([]);
            }
        }catch(err){
            console.error('Error fetching API', err);
        }
    }

    const handleDelete = (index) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
        updateWidgets(newData, disabledRows);
    };

    const openEditPopup = (row) => {
        setEditingRow({...row});
        setPopupOpen(true);
    };
    
    const handleUpdate = (updatedRow) => {
        const updatedData = data.map((row) => 
            row.name === updatedRow.name ? updatedRow : row
        );
        setData(updatedData);
        updateWidgets(updatedData, disabledRows);
        setPopupOpen(false);
    };

    const handleDisable = (index) => {
        if (!disabledRows.includes(index)) {
            setDisabledRows([...disabledRows, index]);
        }
    };

    const updateWidgets = (currentData) => {

        const activeData = currentData.filter((_, index) => !disabledRows.includes(index));

        const totalProducts = activeData.length;
        let totalValue = 0;
        for (let i = 0; i < activeData.length; i++) {
            const item = activeData[i];
            const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.-]/g, '')) : item.price;
            const quantity = parseInt(item.quantity, 10);

            if (!isNaN(price) && !isNaN(quantity)) {
                totalValue += price * quantity;
            }
        }
        const outOfStock = activeData.filter((item) => item.quantity === 0).length;
        const categories = new Set(activeData.map((item) => item.category)).size;
    
        setWidgetData([
            { title: 'Total products', count: totalProducts },
            { title: 'Total store value', count: totalValue },
            { title: 'Out of stocks', count: outOfStock },
            { title: 'No of category', count: categories },
        ]);
    };

  return (
    <div>
        <h1>Inventory Stats</h1>
        <div className="widget-container">
            {widgetData.map((widget, index) => (
                <Widget key={index} title={widget.title} count={widget.count} />
            ))}
        </div>
        <div>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Value</th>
                    <th>ACTION</th>
                </tr>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className={disabledRows.includes(index) ? 'disabled-row' : ''}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>{item.value}</td>
                        <td>
                            <DeleteIcon 
                            onClick={() => isAdmin && handleDelete(index)} 
                            style={{ cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.5 }}
                        />
                        <EditIcon 
                            onClick={() => isAdmin && openEditPopup(item)} 
                            style={{ cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.5 }}
                            disabled={!isAdmin || disabledRows.includes(index)}
                        />
                        <VisibilityIcon 
                            onClick={() => isAdmin && handleDisable(index)} 
                            style={{ cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.5 }}
                        />
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {isPopupOpen && (
                <div className="popup">
                    <h3>Edit Product: {editingRow.name}</h3>
                    <label>Category</label>
                    <input
                        type="text"
                        value={editingRow.category}
                        onChange={(e) => setEditingRow({ ...editingRow, category: e.target.value })}
                    />
                    <label>Price</label>
                    <input
                        type="text"
                        value={editingRow.price}
                        onChange={(e) => setEditingRow({ ...editingRow, price: (e.target.value) })}
                    />
                    <label>Quantity</label>
                    <input
                        type="number"
                        value={editingRow.quantity}
                        onChange={(e) => setEditingRow({ ...editingRow, quantity: (e.target.value) })}
                    />
                    <label>Value</label>
                    <input
                        type="text"
                        value={editingRow.value}
                        onChange={(e) => setEditingRow({ ...editingRow, value: (e.target.value) })}
                    />
                    <div className="popup-buttons">
                        <button onClick={() => handleUpdate(editingRow)}>Update</button>
                        <button onClick={() => setPopupOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default TableView;
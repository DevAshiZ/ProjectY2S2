import React, { useEffect, useState } from "react";
import axios from "axios";

const AddTask = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [OrdersByDistrict, setOrdersByDistrict] = useState([]);
  const [districtOrderCount, setDistrictOrderCount] = useState([]);
  const [firstFiveOrder, setFirstFiveOrders] = useState([]);
  const [massage, setMassage] = useState("");
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8070/Order/orders");
        if (response && response.data && Array.isArray(response.data)) {
          console.log("Response received:", response);

          const orders = response.data.filter(order => order.order_status === "pending");
          console.log("Filtered orders:", orders);

          // Group orders by district
          const ordersByDistrict = {};
          const districtOrderCount ={};
          orders.forEach(order => {
            if (!order.order_district) {
              console.error("District information missing for order:", order);
              return;
            }
            if (!ordersByDistrict[order.order_district]) {
              ordersByDistrict[order.order_district] = [];
              districtOrderCount[order.order_district] = 0;
            }
            ordersByDistrict[order.order_district].push(order);
            districtOrderCount[order.order_district]++;
          });
          console.log("Orders grouped by district:", ordersByDistrict);
          console.log("Order count by district:", districtOrderCount);
          
          setOrdersByDistrict(ordersByDistrict);
          setDistrictOrderCount(districtOrderCount);
          // Set pending orders state
          setPendingOrders(orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchPendingOrders(); // Call the fetch function
  }, [massage]); // Empty dependency array to run once on component mount

  const sendDataToBackend = async () => {
    try {

      //get the first five orders from order array
      const districtWithFiveOrders = Object.keys(OrdersByDistrict).find(district => OrdersByDistrict[district].length >= 5);

      if (districtWithFiveOrders) {
        const firstFiveOrders = OrdersByDistrict[districtWithFiveOrders].slice(0, 5);
        setFirstFiveOrders(firstFiveOrders);
      }

      console.log('firstFiveOrder', firstFiveOrder);


      // get available drivers from  all branches
      const response = await axios.get("http://localhost:8070/Driver/drivers");
      console.log('response:', response.data);
      const drivers = response.data.filter(driver => driver.availability === "Available");
      console.log('filter:', drivers); 
      
      if (drivers.length === 0) {
        setError("No available driver found");
        return;
      }

      //  available drivers are allocate as the district level
      const driversByDistrict = {};
      drivers.forEach(driver => {
        if (!driver.available_district) {
          console.error("District information missing for Driver:", driver);
          return;
        }
        if (!driversByDistrict[driver.available_district]) {
          driversByDistrict[driver.available_district] = [];
        }
        driversByDistrict[driver.available_district].push(driver);
      });
      console.log("Drivers allocate as the district:", driversByDistrict);

      console.log('order Constant:', OrdersByDistrict); 

      // Check for available drivers matching order districts
      const matchingDistricts = Object.keys(OrdersByDistrict).filter(district =>
        Object.keys(driversByDistrict).includes(district) &&
        driversByDistrict[district].length > 0
      );
      console.log('matching districts:', matchingDistricts);

      if (matchingDistricts.length === 0) {
        setError("No available driver found for the order districts");
        return;
      }

      // Get driver IDs for matching districts
      const matchingDriverIds = matchingDistricts.reduce((acc, available_district) => {
        const driversForDistrict = driversByDistrict[available_district];
        const driverIdsForDistrict = driversForDistrict.map(driver => driver._id);
        return [...acc, ...driverIdsForDistrict];
      }, []);

      console.log('Matching driver IDs:', matchingDriverIds);

      const randomDistrict = matchingDistricts[Math.floor(Math.random() * matchingDistricts.length)];
      const randomDriversInDistrict = driversByDistrict[randomDistrict];
      const randomDriver = randomDriversInDistrict[Math.floor(Math.random() * randomDriversInDistrict.length)];

      console.log('randomDriver', randomDriver);

      if (!randomDriver) {
        setError("No available driver found for the selected district");
        return;
      }

      const taskData = {
        driver_id: randomDriver.driver_id,
        branch_id: randomDriver.branch_ID,
        district: randomDistrict,
        orderIds: firstFiveOrder.map(order => order._id)
      };
      
      console.log('Task Data:', taskData);
      console.log('Task Data123:', taskData.driver_id, taskData.branch_id, taskData.district, taskData.orderIds);
    
      await axios.post("http://localhost:8070/Task/add-task", taskData);
     
      setMassage("Task added successfully");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setError("Error occurred while adding task");
    }
  };


  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const hasEnoughOrders = Object.values(districtOrderCount).some(count => count >= 5);
  //     console.log("District Counts:", districtOrderCount);
  //     console.log("Checking for enough orders in any district:", hasEnoughOrders);
  //     if (hasEnoughOrders) {
  //       console.log("Enough orders found. Triggering task assignment.");
  //       sendDataToBackend();                      
  //     } else {
  //       console.log("Not enough orders found.");
  //     }
  //   }, 5 * 1000);

  //   return () => clearInterval(interval);
  // }, [districtOrderCount]);


  useEffect(() => {
    if(Object.values(districtOrderCount).some(count => count >= 5)){
      console.log("Enough orders found. Triggering task assignment.");
      sendDataToBackend();
      return;
    };

    const interval = setInterval(() => {
      const hasEnoughOrders = Object.values(districtOrderCount).some(count => count < 5);
      console.log("Order Counts according to district:", districtOrderCount);
      console.log("Checking for enough orders in any district:", hasEnoughOrders);
      if (hasEnoughOrders) {
        console.log("Not enough orders found.");
      } 
    }, 20 * 1000);
    return () => clearInterval(interval);
  }, [districtOrderCount]);

  return (
    <div>
      <h2>Add Task</h2>
      {error && <p>{error}</p>}
      {massage && <p>{massage}</p>}
    </div>
  );
};

export default AddTask;

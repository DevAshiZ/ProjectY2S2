import React from 'react'
import { SideBar } from '../../components/SideBar'
import { PromotionTab } from '../../components/promotion/promotionTab';


export default function PromotionUI() {
  return (
    <div className="main-layout">
        <SideBar/>
        <div className="inner-layout">
       <PromotionTab supermarketId="6627609e0ecfe8b994946ffe" />
        </div>
    </div>
  );
}
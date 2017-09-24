package com.justetc.hr.service;

import java.util.Date;

import org.springframework.stereotype.Service;

@Service                                                                                 
public class HumanResourceServiceImpl implements HumanResourceService {
   public void bookLeave(Date startDate, Date endDate, String name) {
      System.out.println("Booking holiday for [" + startDate + "-" + endDate + "] for [" + name + "] ");
   }
}
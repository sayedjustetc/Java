package com.justetc.hr.ws;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;

import com.justetc.hr.service.HumanResourceService;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.Namespace;
import org.jdom.xpath.XPath;

@Endpoint                                                                                
public class LeaveEndpoint {

private static final String NAMESPACE_URI = "http://justec.com/hr/schemas";

private XPath startDateExpression;

private XPath endDateExpression;

private XPath nameExpression;

private HumanResourceService humanResourceService;

   @Autowired
   public LeaveEndpoint(HumanResourceService humanResourceService)                      
      throws JDOMException {
      this.humanResourceService = humanResourceService;

      Namespace namespace = Namespace.getNamespace("hr", NAMESPACE_URI);

      startDateExpression = XPath.newInstance("//hr:StartDate");
      startDateExpression.addNamespace(namespace);

      endDateExpression = XPath.newInstance("//hr:EndDate");
      endDateExpression.addNamespace(namespace);

      nameExpression = XPath.newInstance("concat(//hr:FirstName,' ',//hr:LastName)");
      nameExpression.addNamespace(namespace);
   }

   @PayloadRoot(namespace = NAMESPACE_URI, localPart = "LeaveRequest")                  
   public void handleLeaveRequest(@RequestPayload Element leaveRequest)               
      throws Exception {
      SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
      Date startDate = dateFormat.parse(startDateExpression.valueOf(leaveRequest));
      Date endDate = dateFormat.parse(endDateExpression.valueOf(leaveRequest));
      String name = nameExpression.valueOf(leaveRequest);

      humanResourceService.bookLeave(startDate, endDate, name);
   }
}
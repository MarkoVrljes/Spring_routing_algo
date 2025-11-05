package com.marko.routing_backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        // Forward root requests to the static index.html welcome page
        return "forward:/index.html";
    }
}

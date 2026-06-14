package com.driveit.car.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum Drivetrain {
    FWD, RWD, AWD, @JsonProperty("4WD") FOUR_WD;
}

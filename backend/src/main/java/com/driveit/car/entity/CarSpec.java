package com.driveit.car.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "car_specs")
@Getter
@Setter
@NoArgsConstructor
public class CarSpec {
    
    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "car_id")
    private Car car;

    private Integer displacement;
    private Integer horsepower;
    private Integer torque;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType;

    private Integer cylinders;
    private BigDecimal consumption;
    private Integer emissions;
    private Integer length;
    private Integer width;
    private Integer height;
    private Integer wheelbase;
    private Integer trunkCapacity;

    @Column(name = "acceleration_0_to_100")
    private BigDecimal acceleration0To100;
    private Integer topSpeed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    private Drivetrain drivetrain;

    private Integer doors;
    private Integer seats;

}

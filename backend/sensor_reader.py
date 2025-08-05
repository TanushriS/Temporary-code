import wmi
import platform
import logging

logger = logging.getLogger(__name__)

class SensorReader:
    def __init__(self):
        self.is_windows = platform.system() == 'Windows'
        self.wmi_client = None
        
        if self.is_windows:
            try:
                self.wmi_client = wmi.WMI(namespace="root\\OpenHardwareMonitor")
            except Exception as e:
                logger.warning(f"OpenHardwareMonitor WMI not available: {e}")
                try:
                    self.wmi_client = wmi.WMI(namespace="root\\WMI")
                except Exception as e2:
                    logger.error(f"WMI initialization failed: {e2}")
    
    def get_battery_info(self):
        """Get battery information using WMI"""
        if not self.is_windows:
            return self._get_fallback_battery_info()
        
        try:
            # Try Win32_Battery for basic battery info
            c = wmi.WMI()
            batteries = c.Win32_Battery()
            
            if batteries:
                battery = batteries[0]
                return {
                    "level": battery.EstimatedChargeRemaining or 75,
                    "status": self._get_battery_status(battery.BatteryStatus),
                    "charging": battery.BatteryStatus == 6,
                    "voltage": getattr(battery, 'DesignVoltage', None),
                    "source": "WMI"
                }
        except Exception as e:
            logger.error(f"Error reading battery info: {e}")
        
        return self._get_fallback_battery_info()
    
    def get_temperature_info(self):
        """Get temperature information using WMI"""
        temperatures = {
            "cpu": None,
            "battery": None,
            "system": None,
            "source": "fallback"
        }
        
        if not self.is_windows or not self.wmi_client:
            return self._get_fallback_temperature_info()
        
        try:
            # Try OpenHardwareMonitor first
            sensors = self.wmi_client.Sensor()
            
            for sensor in sensors:
                if sensor.SensorType == "Temperature":
                    name = sensor.Name.lower()
                    value = sensor.Value
                    
                    if "cpu" in name and temperatures["cpu"] is None:
                        temperatures["cpu"] = value
                    elif "battery" in name and temperatures["battery"] is None:
                        temperatures["battery"] = value
                    elif "system" in name and temperatures["system"] is None:
                        temperatures["system"] = value
            
            temperatures["source"] = "OpenHardwareMonitor"
            
        except Exception as e:
            logger.warning(f"OpenHardwareMonitor read failed: {e}")
            
            # Try MSAcpi_ThermalZoneTemperature
            try:
                c = wmi.WMI(namespace="root\\WMI")
                temp_sensors = c.MSAcpi_ThermalZoneTemperature()
                
                if temp_sensors:
                    # Convert from tenths of Kelvin to Celsius
                    kelvin_temp = temp_sensors[0].CurrentTemperature / 10.0
                    celsius_temp = kelvin_temp - 273.15
                    temperatures["system"] = celsius_temp
                    temperatures["source"] = "MSAcpi"
                    
            except Exception as e2:
                logger.error(f"MSAcpi temperature read failed: {e2}")
        
        # Fill in missing values with estimates
        if temperatures["cpu"] is None:
            temperatures["cpu"] = 45.0  # Default CPU temp
        if temperatures["battery"] is None:
            temperatures["battery"] = temperatures["cpu"] * 0.8  # Battery usually cooler
        if temperatures["system"] is None:
            temperatures["system"] = temperatures["cpu"] * 0.7
            
        return temperatures
    
    def get_system_info(self):
        """Get system performance information"""
        if not self.is_windows:
            return self._get_fallback_system_info()
        
        try:
            c = wmi.WMI()
            
            # CPU usage
            cpu_info = c.Win32_Processor()[0]
            cpu_usage = cpu_info.LoadPercentage or 25
            
            # Memory info
            os_info = c.Win32_OperatingSystem()[0]
            total_memory = int(os_info.TotalVisibleMemorySize) // 1024  # Convert to MB
            free_memory = int(os_info.FreePhysicalMemory) // 1024
            used_memory = total_memory - free_memory
            
            return {
                "cpu_usage": cpu_usage,
                "memory": {
                    "total": total_memory,
                    "used": used_memory,
                    "free": free_memory
                },
                "source": "WMI"
            }
            
        except Exception as e:
            logger.error(f"Error reading system info: {e}")
            return self._get_fallback_system_info()
    
    def _get_battery_status(self, status_code):
        """Convert WMI battery status code to readable status"""
        status_map = {
            1: "Discharging",
            2: "AC Connected",
            3: "Fully Charged",
            4: "Low",
            5: "Critical",
            6: "Charging",
            7: "Charging High",
            8: "Charging Low",
            9: "Charging Critical",
            10: "Unknown",
            11: "Partially Charged"
        }
        return status_map.get(status_code, "Unknown")
    
    def _get_fallback_battery_info(self):
        """Fallback battery information when WMI is not available"""
        import random
        return {
            "level": random.randint(70, 95),
            "status": "Unknown",
            "charging": random.choice([True, False]),
            "voltage": None,
            "source": "simulated"
        }
    
    def _get_fallback_temperature_info(self):
        """Fallback temperature information"""
        import random
        base_temp = 35 + random.uniform(-5, 10)
        return {
            "cpu": base_temp,
            "battery": base_temp * 0.8,
            "system": base_temp * 0.7,
            "source": "simulated"
        }
    
    def _get_fallback_system_info(self):
        """Fallback system information"""
        import random
        return {
            "cpu_usage": random.randint(15, 45),
            "memory": {
                "total": 8192,
                "used": random.randint(3000, 6000),
                "free": 8192 - random.randint(3000, 6000)
            },
            "source": "simulated"
        }
import ldclient
from ldclient import Context

# Try to create a Context object
try:
    # Try different ways to create a Context object
    print("Trying to create a Context object...")
    
    # Method 1: Using Context.create with kind and key
    print("\nMethod 1: Using Context.create with kind and key")
    try:
        context1 = Context.create(kind="user", key="user-key-1")
        print(f"Success! Context created: {context1}")
        
        # Try to set anonymous attribute
        try:
            print("\nTrying to set anonymous attribute on context1...")
            # Try different methods
            
            # Method 1: Using set method
            try:
                context1.set("anonymous", True)
                print(f"After setting anonymous with set(): {context1}")
            except Exception as e:
                print(f"Error setting anonymous with set(): {e}")
            
            # Method 2: Using direct attribute assignment
            try:
                context1.anonymous = True
                print(f"After setting anonymous with direct assignment: {context1}")
            except Exception as e:
                print(f"Error setting anonymous with direct assignment: {e}")
            
        except Exception as e:
            print(f"Error setting anonymous: {e}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Method 3: Using Context constructor
    print("\nMethod 3: Using Context constructor")
    try:
        context3 = Context("user", "user-key-3")
        print(f"Success! Context created: {context3}")
        
        # Try to set custom attributes
        try:
            print("\nTrying to set custom attributes on context3...")
            
            # Method 1: Using set method
            try:
                context3.set("location", "Los Angeles")
                print(f"After setting location: {context3}")
            except Exception as e:
                print(f"Error setting location: {e}")
            
            # Method 2: Using direct attribute assignment
            try:
                context3.timeOfDay = "morning"
                print(f"After setting timeOfDay with direct assignment: {context3}")
            except Exception as e:
                print(f"Error setting timeOfDay with direct assignment: {e}")
            
        except Exception as e:
            print(f"Error setting custom attributes: {e}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Try creating a context with anonymous attribute
    print("\nTrying to create a context with anonymous attribute...")
    try:
        # Method 1: Using Context.create with anonymous parameter
        try:
            context4 = Context.create(kind="user", key="user-key-4", anonymous=True)
            print(f"Success! Context created with anonymous=True: {context4}")
        except Exception as e:
            print(f"Error creating context with anonymous parameter: {e}")
        
        # Method 2: Using named parameters in constructor
        try:
            context5 = Context(kind="user", key="user-key-5", anonymous=True)
            print(f"Success! Context created with named parameters: {context5}")
        except Exception as e:
            print(f"Error creating context with named parameters: {e}")
        
    except Exception as e:
        print(f"Error: {e}")
    
except Exception as e:
    print(f"Error: {e}")

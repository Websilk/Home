# Developing Components

To begin, you should analyze the `Component.cs` class located in the `/Core` folder of this project. Every component within the Websilk platform inherits this class.

## Creating a new component class

Your component class should be created in a sub-folder within the `/Vendor` folder of this project. Give your sub-folder a proper name, preferably with no spaces, numbers, or special characters. Also, try to follow the file naming structure used for all native components within the `/Components` folder of this project.

Your empty component class should look like:

	using ProtoBuf;

	namespace Websilk.Components
	{
		public class MyComponent: Component
		{
			[ProtoMember(1)]
			public string text = "";
		}
	}

`ProtoBuf` is a Serialization class that highly compresses the component instance when serializing a page after a user saves their page within the [Page Editor](../editor).

You can find documentation for `ProtoBuf` at [https://github.com/mgravell/protobuf-net](https://github.com/mgravell/protobuf-net)

1. Replace `MyComponent` with the name of your component.

2. The property `text` is a custom property specific to the component in this example. Each custom property you create requires a `[ProtoMember(#)]` attribute with an incrementing index #, starting at 1.

3. Optionally, you can include your own namespace

	   namepace Websilk.Components.MyApp { }

4. Create an Sql file in the `/Vender` sub-folder and name it `init.sql`. 

        TODO: Write Sql Source Code Here

   The Sql above will create a reference to your component within the database. Read about [Developing A Websilk Application](developers/applications)
    
